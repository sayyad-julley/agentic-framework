---
name: implementing-redis-production
description: Implements Redis production deployments by applying patterns (Cache-Aside lazy loading, Write-Through consistency, Write-Behind async buffering, atomic rate limiting), following best practices (connection pool sizing, eviction policies volatile-lru/allkeys-lru, HA/Scaling Sentinel/Cluster decision, memory reservations, proactive expiration), implementing workarounds (hot key distribution via client-side caching/read replicas, big key mitigation via splitting/async UNLINK, optimistic locking WATCH/MULTI/EXEC, memory fragmentation MEMORY PURGE), and avoiding anti-patterns (Redis as SoT, big keys >1MB, hot key contention, blocking operations KEYS/unbounded queries, connection pool exhaustion, noeviction on caches, large JSON blobs). Use when deploying Redis in production, optimizing caching strategies, implementing rate limiting, setting up HA/Cluster, managing memory, mitigating big/hot keys, or configuring persistence RDB/AOF.
version: 1.0.0
dependencies:
  - redis>=5.0.0
  - redis-py>=5.0.0
---

# Implementing Redis Production

## Overview

Implements Redis production deployments using in-memory data structure server patterns. Redis serves as a single-threaded, low-latency engine for caching, rate limiting, session management, and message brokering. The single-threaded architecture mandates careful operational practices, as any lengthy operation blocks all clients. This skill provides procedural knowledge for caching patterns, connection management, HA/Scaling decisions, persistence strategies, memory management, atomic operations, and big/hot key mitigation while avoiding critical operational anti-patterns.

## When to Use

Use this skill when:
- Implementing Redis caching strategies (Cache-Aside, Write-Through, Write-Behind)
- Setting up high availability (Sentinel) or horizontal scaling (Cluster)
- Optimizing connection pools and memory management
- Implementing rate limiting and atomic operations
- Mitigating big key and hot key issues
- Configuring persistence (RDB/AOF) strategies
- Detecting and avoiding operational anti-patterns

**Input format**: Redis server access (standalone, Sentinel, or Cluster), data consistency requirements, target throughput, memory constraints

**Expected output**: Production-ready Redis configuration following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Redis server access (standalone, Sentinel, or Cluster endpoints)
- Understanding of data consistency requirements (strong vs eventual)
- Network connectivity to Redis instances
- Appropriate memory and connection limits configured
- Access to Redis configuration files (redis.conf, sentinel.conf)

## Execution Steps

### Step 1: Caching Patterns

Selecting the appropriate caching pattern is an architectural decision balancing data consistency with performance objectives.

#### Cache-Aside (Lazy Loading)

**Pattern**: Application checks cache first, queries database on miss, then populates cache.

**Template**:
```python
import redis
r = redis.Redis(connection_pool=pool)

def cache_aside_get(key, db_fetch_func, ttl=3600):
    # Check cache
    cached = r.get(key)
    if cached:
        return cached
    
    # Cache miss: fetch from DB
    data = db_fetch_func()
    
    # Populate cache
    r.setex(key, ttl, data)
    return data
```

**Cache Stampede Mitigation**:
```python
def cache_aside_with_lock(key, db_fetch_func, ttl=3600, lock_ttl=10):
    # Try cache first
    cached = r.get(key)
    if cached:
        return cached
    
    # Acquire lock to prevent stampede
    lock_key = f"{key}:lock"
    if r.set(lock_key, "1", nx=True, ex=lock_ttl):
        try:
            data = db_fetch_func()
            r.setex(key, ttl, data)
            return data
        finally:
            r.delete(lock_key)
    else:
        # Another process is fetching, wait and retry
        time.sleep(0.1)
        return r.get(key) or db_fetch_func()
```

**Best Practice**: Proactive expiration prevents eviction sweeps. Use probabilistic early expiration to reduce stampede risk.

**Anti-Pattern**: ❌ No expiration on cache keys (causes memory pressure and eviction sweeps)

#### Write-Through

**Pattern**: Synchronously update both cache and database before acknowledging write.

**Template**:
```python
def write_through(key, value, db_write_func, ttl=3600):
    # Write to database first
    db_write_func(key, value)
    
    # Then update cache
    r.setex(key, ttl, value)
    return True
```

**Best Practice**: Use transactions (MULTI/EXEC) if both operations must succeed atomically.

**Trade-off**: Higher write latency due to synchronous database write.

#### Write-Behind (Async Buffering)

**Pattern**: Write to Redis immediately, asynchronously sync to database via background process (e.g., RedisGears).

**Template**:
```python
def write_behind(key, value, ttl=3600):
    # Write to Redis only
    r.setex(key, ttl, value)
    
    # Queue for async DB sync (via RedisGears or background worker)
    r.lpush("write_queue", json.dumps({"key": key, "value": value}))
    return True
```

**Best Practice**: Use RedisGears for programmable async synchronization to database.

**Trade-off**: Temporary inconsistency between cache and database. Suitable only for non-critical, eventually consistent data (logging, telemetry, metrics).

**Anti-Pattern**: ❌ Using Write-Behind for critical transactional data requiring immediate consistency

### Step 2: Connection Pool Management

Connection pool exhaustion is a frequent cause of production incidents. Default pool sizes (e.g., 50) are often insufficient.

#### Pool Sizing Formula

**Template**:
```python
# Calculate pool size based on load
concurrent_requests = 1000  # Peak concurrent requests
avg_request_duration_ms = 50  # Average Redis operation duration
pool_size = (concurrent_requests * avg_request_duration_ms) / 1000
pool_size = int(pool_size * 1.5)  # 50% headroom
# Result: pool_size = 75, but use 100+ for production
```

**Best Practice**: Monitor connection pool usage and scale proactively before hitting limits.

#### Configuration Template

```python
from redis.connection import ConnectionPool

pool = ConnectionPool(
    host='localhost',
    port=6379,
    max_connections=100,  # Increase from default 50
    socket_connect_timeout=5,
    socket_timeout=5,
    retry_on_timeout=True,
    health_check_interval=30
)

r = redis.Redis(connection_pool=pool)
```

**Anti-Pattern**: ❌ Using default pool sizes without load testing, ❌ Not monitoring connection pool usage

**Organizational Risk**: Post-mortem fixes for connection pool exhaustion must be prioritized as existential business risks, not low-priority technical debt.

### Step 3: High Availability and Scaling

Selecting the correct deployment model determines capacity for HA and horizontal scaling.

#### Sentinel vs Cluster Decision Matrix

| Feature | Redis Sentinel | Redis Cluster |
|---------|---------------|---------------|
| Primary Goal | High Availability (Failover, Monitoring) | Scalability (Data Sharding, High Throughput) |
| Data Scaling | Vertical (Limited by single master capacity) | Horizontal (Linear scaling up to 1000 nodes) |
| Operational Complexity | Lower, easier to manage HA for smaller datasets | Higher, requires management of hash slots and rebalancing |
| Sharding Threshold | Not Sharded | Mandatory for databases exceeding ~25GB or 25K Ops/sec |

**Decision Rule**: Use Sentinel for HA when dataset fits on single machine. Use Cluster when exceeding 25GB or 25K ops/sec.

#### Sentinel Configuration Template

**Best Practice**: Use odd number of nodes (3, 5, 7) for reliable majority voting and split-brain prevention.

```bash
# sentinel.conf
sentinel monitor mymaster 127.0.0.1 6379 2  # Quorum: 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
sentinel parallel-syncs mymaster 1
```

**Client Connection Template**:
```python
from redis.sentinel import Sentinel

sentinel = Sentinel([
    ('sentinel1', 26379),
    ('sentinel2', 26379),
    ('sentinel3', 26379)
], socket_timeout=0.1)

master = sentinel.master_for('mymaster', socket_timeout=0.1)
slave = sentinel.slave_for('mymaster', socket_timeout=0.1)
```

#### Cluster Configuration Template

**Sharding Threshold**: Shard when database exceeds ~25GB or handles >25K ops/sec.

```bash
# redis.conf for each node
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
```

**Client Connection Template**:
```python
from redis.cluster import RedisCluster

rc = RedisCluster(
    startup_nodes=[
        {"host": "127.0.0.1", "port": "7000"},
        {"host": "127.0.0.1", "port": "7001"},
        {"host": "127.0.0.1", "port": "7002"}
    ],
    decode_responses=True
)
```

**Best Practice**: Odd number of nodes for majority voting. Monitor hash slot distribution and rebalance as needed.

**Anti-Pattern**: ❌ Using Cluster for small datasets that fit on single machine (unnecessary complexity)

### Step 4: Persistence Strategy

Persistence protects against data loss but trades performance for durability.

#### RDB vs AOF Decision

**RDB (Redis Database) Snapshots**:
- **Use Case**: Prioritize optimal throughput, acceptable data loss between snapshots
- **Trade-off**: Minimal performance impact, potential data loss between snapshots

**AOF (Append Only File)**:
- **Use Case**: Minimal data loss is primary requirement
- **Trade-off**: Full reconstruction capability, potential throughput overhead

**Hybrid Configuration** (Recommended):
```bash
# redis.conf
save 900 1      # RDB: Save after 900s if 1+ key changed
save 300 10     # RDB: Save after 300s if 10+ keys changed
save 60 10000   # RDB: Save after 60s if 10000+ keys changed

appendonly yes              # Enable AOF
appendfsync everysec        # Sync every second (balance of performance/durability)
no-appendfsync-on-rewrite yes
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

**Best Practice**: Hybrid RDB+AOF provides comprehensive durability and recovery.

**Anti-Pattern**: ❌ No persistence on critical data, ❌ AOF with always sync (severe performance impact)

### Step 5: Memory Management

Effective memory management is critical for Redis stability. Insufficient memory leads to performance degradation and write failures.

#### Eviction Policy Selection

**volatile-lru** (Default for caches):
- Evicts only keys with TTL set
- Optimized for dedicated transient caches (session stores)

**allkeys-lru**:
- Evicts any key regardless of TTL
- Provides operational resilience if memory pressure becomes acute

**Configuration Template**:
```bash
# redis.conf
maxmemory 4gb
maxmemory-policy volatile-lru  # or allkeys-lru
```

**Best Practice**: Proactively set expiration (EXPIRE) on keys to minimize reactive eviction sweeps.

**Anti-Pattern**: ❌ `noeviction` on cache systems (causes Redis to stop accepting writes when memory is full)

#### Memory Reservation Configuration

**Template**:
```bash
# redis.conf
maxmemory 4gb
maxmemory-reserved 512mb              # 10-15% for operational needs
maxfragmentationmemory-reserved 256mb # For fragmentation overhead
```

**Best Practice**: Reserve 10-60% of total memory for:
- Client buffers
- Replication buffers (critical during failover)
- Memory fragmentation overhead

**Impact**: Insufficient reservation can cause replication buffer overflow during peak load, leading to failover instability.

#### Fragmentation Mitigation

**Monitoring Template**:
```python
info = r.info('memory')
fragmentation_ratio = info['mem_fragmentation_ratio']
# If > 1.5, consider MEMORY PURGE
```

**Mitigation Template**:
```python
# Force release of unused memory (Redis 4+)
r.execute_command('MEMORY', 'PURGE')
```

**Best Practice**: Monitor `mem_fragmentation_ratio`. Use MEMORY PURGE after bulk data removal.

**Anti-Pattern**: ❌ Ignoring high fragmentation (reduces effective capacity)

### Step 6: Atomic Operations and Concurrency

Redis avoids blocking locks, favoring optimistic locking and atomic transactions for concurrency control.

#### Atomic Rate Limiting

**Pattern**: Use INCR + EXPIRE atomically to prevent race conditions.

**Template**:
```python
def rate_limit(key, limit, window_seconds):
    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, window_seconds)
    count, _ = pipe.execute()
    
    if count > limit:
        return False  # Rate limit exceeded
    return True
```

**Best Practice**: Use pipeline or Lua script to ensure atomicity of INCR + EXPIRE.

**Anti-Pattern**: ❌ Non-atomic check-then-increment (allows race conditions)

#### Optimistic Locking with WATCH

**Pattern**: WATCH key(s), queue commands with MULTI, execute with EXEC only if watched keys unchanged.

**Template**:
```python
def optimistic_update(key, update_func, max_retries=3):
    for attempt in range(max_retries):
        r.watch(key)
        current_value = r.get(key)
        new_value = update_func(current_value)
        
        pipe = r.pipeline()
        pipe.multi()
        pipe.set(key, new_value)
        
        try:
            pipe.execute()
            return True  # Success
        except redis.WatchError:
            continue  # Retry on conflict
    
    return False  # Max retries exceeded
```

**Best Practice**: Implement retry logic in application layer. WATCH/MULTI/EXEC ensures atomicity without blocking.

**Anti-Pattern**: ❌ Not handling WatchError (transaction silently fails)

### Step 7: Big Key and Hot Key Mitigation

Big keys (>1MB) and hot keys (high access rate) cause severe performance degradation in single-threaded architecture.

#### Big Key Detection

**Template**:
```bash
# Use redis-cli --bigkeys
redis-cli --bigkeys

# Or programmatic detection
redis-cli --scan --pattern "*" | while read key; do
    size=$(redis-cli STRLEN "$key" 2>/dev/null || redis-cli HLEN "$key" 2>/dev/null)
    if [ "$size" -gt 1048576 ]; then  # > 1MB
        echo "Big key: $key (size: $size)"
    fi
done
```

**Python Detection Template**:
```python
def detect_big_keys(pattern="*", threshold=1048576):  # 1MB
    cursor = 0
    big_keys = []
    
    while True:
        cursor, keys = r.scan(cursor, match=pattern, count=100)
        for key in keys:
            size = r.memory_usage(key) or 0
            if size > threshold:
                big_keys.append((key, size))
        
        if cursor == 0:
            break
    
    return big_keys
```

#### Big Key Mitigation

**Splitting Strategy Template**:
```python
# Instead of: user:123 = {huge JSON object}
# Use: user:123:profile, user:123:settings, user:123:preferences

def split_big_hash(key, chunk_size=100):
    data = r.hgetall(key)
    chunks = [dict(list(data.items())[i:i+chunk_size]) 
              for i in range(0, len(data), chunk_size)]
    
    for i, chunk in enumerate(chunks):
        r.hmset(f"{key}:chunk:{i}", chunk)
    
    r.delete(key)  # Use UNLINK for async deletion
```

**Async Deletion Template**:
```python
# Use UNLINK instead of DEL for large keys
r.unlink(key)  # Removes key reference immediately, frees memory in background
```

**Best Practice**: Split large structures into multiple smaller keys. Use UNLINK for deletion to avoid blocking.

**Anti-Pattern**: ❌ Large keys (>1MB) causing latency spikes, ❌ Using DEL instead of UNLINK for large keys

#### Hot Key Workarounds

**Problem**: Sharding cannot resolve hot key contention. Key's hash ensures it resides on single shard, saturating that shard's CPU.

**Client-Side Caching Template**:
```python
# Stop request before reaching Redis
local_cache = {}

def get_with_local_cache(key, ttl=60):
    # Check local cache first
    if key in local_cache:
        return local_cache[key]
    
    # Fetch from Redis
    value = r.get(key)
    local_cache[key] = value
    # Expire from local cache after ttl
    return value
```

**Read Replica Distribution Template**:
```python
# Distribute reads across replicas
replicas = [r1, r2, r3]  # Read replicas

def get_from_replica(key):
    # Round-robin or random selection
    replica = random.choice(replicas)
    return replica.get(key)
```

**Best Practice**: For read-heavy hot keys, use client-side caching or distribute reads across multiple read replicas.

**Anti-Pattern**: ❌ Relying solely on sharding to resolve hot key contention

### Step 8: Data Modeling

Model data structures based on query patterns. Avoid storing complex hierarchical data as large opaque JSON strings.

#### RedisJSON Template

**Pattern**: Field-level JSON manipulation without full deserialization.

```python
# Requires redisjson module
import redis
r = redis.Redis()

# Store JSON
r.json().set("user:123", "$", {"name": "John", "age": 30})

# Update specific field
r.json().set("user:123", "$.age", 31)

# Get specific field (no full object transfer)
age = r.json().get("user:123", "$.age")
```

**Best Practice**: Use RedisJSON for field-level access, avoiding full object retrieval and reserialization.

**Anti-Pattern**: ❌ Storing large JSON as opaque strings (requires full deserialize/modify/reserialize on any update)

#### RediSearch Template

**Pattern**: Native indexing and querying for document store functionality.

```python
# Create index
r.ft().create_index(
    fields=[
        redis.TextField("name"),
        redis.NumericField("age")
    ]
)

# Search
results = r.ft().search("user:*", "@age:[25 35]")
```

**Best Practice**: Pair RedisJSON with RediSearch for high-performance document store with query capabilities.

#### Query-Driven Modeling

**Pattern**: Denormalize related data (Aggregate Pattern, Bucket Pattern) to enable single atomic fetch.

**Template**:
```python
# Aggregate Pattern: Store related data together
r.hset("user:123", mapping={
    "name": "John",
    "email": "john@example.com",
    "last_login": "2024-01-01"
})  # Single HGETALL fetches all related data

# Bucket Pattern: Time-series data in buckets
r.zadd("events:2024-01", {event_id: timestamp})
```

**Best Practice**: Model data structures based purely on anticipated query patterns. Maximize single atomic operation fetches.

### Step 9: Operational Anti-Patterns Avoidance

#### Anti-Pattern Checklist

**❌ Redis as Primary System of Record**
- **Detection**: Data volume exceeds available RAM, no primary database backup
- **Mitigation**: Use Redis for volatile operational data only. Maintain durable database as source of truth.

**❌ Blocking Operations**
- **Detection**: KEYS command usage, unbounded ZRANGE 0 -1, O(N) operations
- **Mitigation**: Use SCAN instead of KEYS, limit range queries (ZRANGE 0 99), avoid O(N) commands

**❌ Big Keys (>1MB)**
- **Detection**: Keys causing latency spikes, high memory fragmentation
- **Mitigation**: Split into multiple keys, use UNLINK for deletion, monitor with --bigkeys

**❌ Hot Keys on Single Shard**
- **Detection**: Single shard CPU saturation despite cluster capacity
- **Mitigation**: Client-side caching, read replica distribution, architectural workarounds

**❌ Connection Pool Exhaustion**
- **Detection**: 500 errors, connection timeouts, max connections hit
- **Mitigation**: Size pools based on load formula, monitor usage, scale proactively

**❌ noeviction on Cache Systems**
- **Detection**: Redis stops accepting writes when memory full
- **Mitigation**: Use volatile-lru or allkeys-lru, never noeviction for caches

**❌ Large JSON Blobs**
- **Detection**: Full deserialize/modify/reserialize on every update
- **Mitigation**: Use RedisJSON for field-level manipulation

## Transformation Rules

1. **Key Naming**: Globally unique, immutable identifiers (project ID), not mutable attributes (full path, name). If object renamed, use explicit hook to expire entry rather than relying on key name.

2. **Expiration**: Proactively set EXPIRE on keys to minimize eviction sweeps. Use probabilistic early expiration to reduce cache stampede risk.

3. **Command Complexity**: Avoid O(N) operations. Use SCAN instead of KEYS. Limit range queries (ZRANGE 0 99, not ZRANGE 0 -1).

4. **Atomicity**: Use pipelines or Lua scripts to ensure atomicity of multi-command operations (e.g., INCR + EXPIRE).

## Examples

### Example 1: Cache-Aside with Stampede Protection

**Context**: User profile caching with database fallback.

```python
import redis
import time
from functools import wraps

r = redis.Redis(connection_pool=pool)

def get_user_profile(user_id):
    key = f"user:profile:{user_id}"
    
    # Try cache
    cached = r.get(key)
    if cached:
        return json.loads(cached)
    
    # Cache miss: acquire lock
    lock_key = f"{key}:lock"
    if r.set(lock_key, "1", nx=True, ex=10):
        try:
            # Fetch from DB
            profile = db.get_user_profile(user_id)
            r.setex(key, 3600, json.dumps(profile))
            return profile
        finally:
            r.delete(lock_key)
    else:
        # Another process fetching, wait briefly
        time.sleep(0.1)
        cached = r.get(key)
        return json.loads(cached) if cached else db.get_user_profile(user_id)
```

**Key Points**: Lock prevents cache stampede. Fallback to DB if lock acquisition fails.

### Example 2: Atomic Rate Limiting

**Context**: API rate limiting (100 requests per minute per user).

```python
def check_rate_limit(user_id, limit=100, window=60):
    key = f"rate_limit:{user_id}"
    
    pipe = r.pipeline()
    pipe.incr(key)
    pipe.expire(key, window)
    count, _ = pipe.execute()
    
    return count <= limit

# Usage
if not check_rate_limit(user_id):
    return {"error": "Rate limit exceeded"}, 429
```

**Key Points**: Atomic INCR + EXPIRE prevents race conditions. Pipeline ensures both commands execute together.

## Error Handling

**Connection Pool Exhaustion**:
- **Detection**: Monitor connection pool usage, alert at 80% capacity
- **Resolution**: Increase max_connections, scale pool size based on load formula
- **Prevention**: Proactive sizing, load testing before production

**Memory Pressure**:
- **Detection**: Monitor memory usage, eviction policy triggers
- **Resolution**: Adjust eviction policy, increase maxmemory, add memory reservations
- **Prevention**: Proactive key expiration, memory reservation configuration

**Replication Buffer Overflow**:
- **Detection**: Monitor replication buffer size during failover
- **Resolution**: Increase maxmemory-reserved for replication buffers
- **Prevention**: Configure adequate memory reservations (10-60% of total)

**Transaction Conflicts (WATCH)**:
- **Detection**: WatchError exceptions during EXEC
- **Resolution**: Implement retry logic with exponential backoff
- **Prevention**: Design transactions to minimize contention windows

**Big Key Operations**:
- **Detection**: Latency spikes, high memory fragmentation
- **Resolution**: Split keys, use UNLINK for deletion, monitor with --bigkeys
- **Prevention**: Design data structures to avoid large keys from start

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in SKILL.md or scripts
- ✅ Use external credential management systems
- ✅ Route sensitive operations through secure channels

**Operational Constraints**:
- Use connection pooling with authentication
- Secure network channels (TLS) for production
- Implement proper access controls (ACL, password authentication)
- Monitor for unauthorized access attempts

## Dependencies

This skill requires the following packages (listed in frontmatter):
- `redis>=5.0.0`: Redis Python client for connection management
- `redis-py>=5.0.0`: Advanced Redis features (Cluster, Sentinel, modules)

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment. The skill cannot install packages at runtime.

## Performance Considerations

- **Single-Threaded Architecture**: Any lengthy operation blocks all clients. Control command time complexity strictly.
- **Memory Fragmentation**: Monitor mem_fragmentation_ratio, use MEMORY PURGE after bulk operations.
- **Connection Pool Sizing**: Size based on concurrent load formula, not defaults.
- **Sharding Threshold**: Use Cluster when exceeding 25GB or 25K ops/sec.
- **Command Complexity**: Avoid O(N) operations. Prefer SCAN over KEYS, limit range queries.

## Related Resources

For extensive reference materials, see:
- `resources/REDIS_REFERENCE.md`: Detailed patterns, examples, and advanced configurations (if created)

## Notes

- Redis single-threaded model requires careful command selection and complexity management
- Memory management is critical: insufficient memory causes write failures and performance degradation
- Connection pool sizing must be proactive, not reactive
- Hot keys cannot be resolved by sharding alone; architectural workarounds required
- Big keys cause latency spikes; split into smaller structures
- Organizational rigor: prioritize post-mortem fixes as existential business risks, not technical debt

