---
name: implementing-redis-7-alpine-containerized
description: Implements Redis 7-Alpine containerized deployments by applying container-specific patterns (multi-stage builds for musl/glibc compatibility, network isolation, connection pooling/multiplexing, pipelining, Lua scripting with EVALSHA), following best practices (Alpine image optimization, security hardening with CONFIG command disable, AOF persistence, LFU eviction for hot keys, co-location strategies), implementing workarounds (client-side caching for hot keys, key sharding, MEMORY PURGE for fragmentation, cache stampede mutex locks), and avoiding anti-patterns (KEYS command blocking, caching without TTL, hot key bottlenecks, JSON string storage, frequent connection open/close, musl/glibc compatibility issues). Use when deploying Redis 7 in Docker/Kubernetes with Alpine images, optimizing containerized Redis performance, handling musl libc compatibility, securing containerized Redis instances, or implementing high-performance patterns in containerized environments.
version: 1.0.0
dependencies:
  - redis>=7.0.0
  - redis-py>=5.0.0
---

# Implementing Redis 7-Alpine Containerized Deployment

## Overview

Implements Redis 7 in Alpine Linux containers with focus on containerized deployment patterns, Alpine/musl libc compatibility, and high-performance strategies. The redis:7-alpine image provides minimal footprint (~5MB base) but introduces musl libc trade-offs requiring multi-stage builds for application compatibility. This skill provides procedural knowledge for secure, performant containerized Redis deployments while avoiding critical anti-patterns specific to containerized environments.

## When to Use

Use this skill when:
- Deploying Redis 7 in Docker/Kubernetes with Alpine images
- Optimizing containerized Redis performance and latency
- Handling musl libc compatibility in consuming applications
- Securing containerized Redis instances with network isolation
- Implementing high-performance patterns (pipelining, Lua scripting) in containers
- Mitigating hot keys and big keys in containerized environments
- Configuring persistence and memory management in containers

**Input format**: Docker/Kubernetes environment, Redis 7-Alpine image, application client libraries, network topology requirements, performance targets

**Expected output**: Production-ready containerized Redis configuration following container-specific patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Docker/Kubernetes container orchestration environment
- Understanding of Alpine Linux and musl libc vs glibc differences
- Network isolation capabilities (internal networks, service meshes)
- Container resource limits and constraints defined
- Access to Redis configuration files (redis.conf) for container deployment
- Application client libraries compatible with containerized Redis

## Execution Steps

### Step 1: Alpine Environment and musl libc Considerations

The redis:7-alpine image uses musl libc instead of glibc, requiring architectural decisions for consuming applications.

#### Multi-Stage Docker Build Pattern

**Pattern**: Build in full-featured stage with complete toolchain, deploy minimal runtime with only necessary shared libraries.

**Template**:
```dockerfile
# Build stage: Full-featured environment
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Runtime stage: Minimal Alpine with only runtime dependencies
FROM redis:7-alpine
RUN apk add --no-cache python3 py3-pip
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
```

**Best Practice**: Use multi-stage builds to isolate build-time dependencies from runtime. Copy only necessary runtime shared libraries to final image.

**Anti-Pattern**: ❌ Direct glibc dependencies in Alpine containers (causes runtime failures). ❌ Including development toolchain in final image (increases size and attack surface).

**Compatibility Note**: Applications or client libraries compiled expecting glibc behaviors (e.g., certain NSS features) may fail. Multi-stage builds mitigate this by building in glibc environment and copying only runtime artifacts.

### Step 2: Container Security Hardening

Security for containerized Redis requires network isolation and internal command restrictions.

#### Network Isolation Pattern

**Pattern**: Never expose Redis directly to public internet. Limit access to internal container networks or trusted application front-ends.

**Template**:
```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    networks:
      - internal
    ports: []  # No exposed ports

  app:
    image: app:latest
    networks:
      - internal
    depends_on:
      - redis

networks:
  internal:
    internal: true  # Isolated network
```

**Best Practice**: Use internal Docker networks. In Kubernetes, use ClusterIP services (not NodePort/LoadBalancer) for Redis.

#### CONFIG Command Disable

**Pattern**: Disable or rename CONFIG command to prevent system compromise via RDB file manipulation.

**Template**:
```bash
# redis.conf
rename-command CONFIG ""
# Or rename to secure value:
# rename-command CONFIG "a1b2c3d4e5f6g7h8"
```

**Best Practice**: Disable CONFIG command in production. If renaming, use cryptographically secure random string.

**Anti-Pattern**: ❌ Public Redis exposure (allows exploitation attempts). ❌ CONFIG command enabled (allows arbitrary RDB file writes to system-critical locations).

**Security Impact**: CONFIG command can change working directory and dump file name, enabling writes to cron directories or authorized_keys files, compromising system under Redis user permissions.

### Step 3: Connection Management in Containers

Efficient connection management overcomes RTT limitations in containerized environments.

#### Connection Pooling Pattern (Python)

**Pattern**: Initialize persistent connection pool, reuse connections across requests.

**Template**:
```python
import redis

POOL = redis.ConnectionPool(
    host='redis',  # Container service name
    port=6379,
    db=0,
    max_connections=50,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5
)

def get_redis_client():
    return redis.Redis(connection_pool=POOL)

# Usage
r = get_redis_client()
r.set('key', 'value')
```

**Best Practice**: Size pool based on concurrent load: `pool_size = (concurrent_requests * avg_duration_ms) / 1000 * 1.5`. Monitor pool usage, scale proactively.

#### Connection Multiplexing Pattern (Node.js)

**Pattern**: Single long-lived connection handles all traffic via internal request routing.

**Template**:
```javascript
const redis = require('redis');
const client = redis.createClient({
  url: 'redis://redis:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  }
});

// Single connection handles all commands
await client.connect();
await client.set('key', 'value');
```

**Best Practice**: Use singleton client instance throughout application lifecycle. Configure automatic reconnection with exponential backoff.

**Anti-Pattern**: ❌ Opening/closing connections per command (introduces RTT overhead). ❌ Default pool sizes without load testing (causes exhaustion under load).

**Performance Impact**: Frequent connection open/close adds 250ms+ RTT per operation, limiting throughput to ~4 ops/sec on slow networks. Connection pooling/multiplexing eliminates this overhead.

### Step 4: Persistence in Containerized Environments

Data durability requires persistence configuration even in ephemeral container environments.

#### AOF Persistence Pattern

**Pattern**: Enable AOF (Append Only File) for higher durability than RDB snapshots.

**Template**:
```bash
# redis.conf
appendonly yes
appendfsync everysec  # Balance performance/durability
no-appendfsync-on-rewrite yes
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Optional: Hybrid RDB + AOF
save 900 1
save 300 10
save 60 10000
```

**Best Practice**: Use AOF for critical data. Configure `everysec` sync policy (balance of performance and durability). For ephemeral containers, mount persistent volumes for AOF files.

**Anti-Pattern**: ❌ No persistence on critical data (data loss on container restart). ❌ AOF with `always` sync (severe performance impact, ~10x slower).

**Container Consideration**: Mount persistent volumes for AOF/RDB files. In Kubernetes, use PersistentVolumeClaims. Without persistence, container restarts lose all data.

### Step 5: High-Performance Patterns

Achieving microsecond latency requires pipelining and server-side Lua scripting.

#### Pipelining for Bulk Operations

**Pattern**: Batch multiple independent commands into single network round trip.

**Template**:
```python
r = redis.Redis(connection_pool=pool)

pipe = r.pipeline()
for i in range(100):
    pipe.set(f'bulk_key:{i}', i)
results = pipe.execute()  # Single network round trip
```

**Best Practice**: Use pipelining for bulk independent operations. Cannot use if command requires result of preceding command (R-C-W dependency).

**Performance Impact**: Pipelining amortizes RTT across batch. 100 commands with 250ms RTT: sequential = 25 seconds, pipelined = ~250ms.

#### Lua Scripting with EVALSHA

**Pattern**: Pre-load Lua scripts, execute via EVALSHA digest to minimize network bandwidth.

**Template**:
```python
# Pre-load script
script = """
local current = redis.call('get', KEYS[1])
if current then
    return tonumber(current) + tonumber(ARGV[1])
else
    redis.call('set', KEYS[1], ARGV[1])
    return ARGV[1]
end
"""
sha = r.script_load(script)

# Execute via EVALSHA
result = r.evalsha(sha, 1, 'counter', 5)

# High-performance: Pipeline multiple EVALSHA
pipe = r.pipeline()
pipe.evalsha(sha, 1, 'key1', 1)
pipe.evalsha(sha, 1, 'key2', 2)
results = pipe.execute()
```

**Best Practice**: Pre-load scripts at application startup. Use EVALSHA instead of EVAL to reduce network bandwidth. Combine with pipelining for maximum throughput.

**Anti-Pattern**: ❌ Sending full script with every execution (wastes bandwidth). ❌ Sequential command execution (RTT limits throughput).

**Atomicity**: Lua scripts execute atomically. Once started, no other command interrupts until completion, eliminating race conditions.

### Step 6: Hot Key and Big Key Mitigation

Single-threaded architecture means hot keys or big keys block all clients.

#### Key Sharding for Hot Keys

**Pattern**: Distribute hot key traffic across multiple keys using hash suffix.

**Template**:
```python
import hashlib

def get_sharded_key(base_key, shard_count=10):
    hash_val = int(hashlib.md5(base_key.encode()).hexdigest(), 16)
    shard = hash_val % shard_count
    return f"{base_key}:shard:{shard}"

# Usage
sharded_key = get_sharded_key('user:123:profile', shard_count=10)
r.hset(sharded_key, mapping=data)
```

**Best Practice**: Use LFU eviction policy for hot keys: `maxmemory-policy allkeys-lfu`. LFU prioritizes frequently accessed items, protecting critical data.

**Anti-Pattern**: ❌ Single key handling high traffic (overwhelms single shard in cluster). ❌ Using LRU instead of LFU for hot keys (LRU evicts based on recency, not frequency).

**Cluster Impact**: In cluster mode, single key always routes to one shard. If 1% of keys handle 99% of traffic, cluster benefit negated. Sharding distributes requests across multiple keys and shards.

#### SCAN Instead of KEYS

**Pattern**: Use SCAN for non-blocking key space iteration.

**Template**:
```python
cursor = 0
keys = []

while True:
    cursor, batch = r.scan(cursor, match='pattern:*', count=100)
    keys.extend(batch)
    if cursor == 0:
        break
```

**Best Practice**: Use SCAN for key iteration. Spreads work over multiple non-blocking calls. Limit with `count` parameter (default 10, increase for efficiency).

**Anti-Pattern**: ❌ KEYS command (O(N) complexity, blocks entire server). ❌ Unbounded range queries (ZRANGE 0 -1 blocks server).

**Impact**: KEYS on production instance with large dataset paralyzes server until completion. SCAN iterates incrementally without blocking.

### Step 7: Data Structure Selection

Use specialized Redis data structures instead of generic string storage.

#### HASH Instead of JSON Strings

**Pattern**: Use HASH data structure for mutable structured data, enabling atomic field-level updates.

**Template**:
```python
# Anti-pattern: JSON string
r.set('user:123', json.dumps({'name': 'John', 'age': 30}))
# Requires: fetch, deserialize, modify, serialize, write (non-atomic)

# Best practice: HASH
r.hset('user:123', mapping={'name': 'John', 'age': 30})
r.hset('user:123', 'age', 31)  # Atomic field update
profile = r.hgetall('user:123')  # Single atomic fetch
```

**Best Practice**: Use HASH for structured mutable data. Enables atomic field updates without full object transfer. Alternative: RedisJSON module for native JSON with atomic manipulation.

**Anti-Pattern**: ❌ Storing JSON as opaque strings (requires full deserialize/modify/reserialize cycle, non-atomic). ❌ Large JSON blobs (>1MB) causing latency spikes.

**Performance**: HASH field updates are atomic and efficient. JSON string updates require application-side locking (WATCH/MULTI/EXEC) to ensure atomicity, adding complexity.

### Step 8: Cache Stampede Prevention

Cache stampede occurs when expired key triggers concurrent database hits.

#### Distributed Mutex Lock Pattern

**Pattern**: Atomic lock acquisition prevents multiple clients from regenerating cache simultaneously.

**Template**:
```python
def cache_aside_with_lock(key, db_fetch_func, ttl=3600, lock_ttl=10):
    # Try cache first
    cached = r.get(key)
    if cached:
        return cached
    
    # Acquire lock atomically
    lock_key = f"{key}:lock"
    unique_id = str(uuid.uuid4())
    
    if r.set(lock_key, unique_id, nx=True, ex=lock_ttl):
        try:
            data = db_fetch_func()
            r.setex(key, ttl, data)
            return data
        finally:
            # Safe lock release (Lua script)
            release_script = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            """
            r.eval(release_script, 1, lock_key, unique_id)
    else:
        # Another process has lock, wait and retry
        time.sleep(0.1)
        return r.get(key) or db_fetch_func()
```

**Best Practice**: Use atomic SET NX EX for lock acquisition. Implement safe lock release via Lua script (verify ownership before delete). Set lock TTL to prevent permanent lock if client crashes.

**Anti-Pattern**: ❌ No protection against cache stampede (concurrent database hits overwhelm backend). ❌ Non-atomic lock acquisition (race conditions).

**Impact**: Cache stampede on high-traffic expired keys can cause cascading backend failures. Mutex lock ensures only one client regenerates cache.

### Step 9: Memory Management

All cache keys must have TTL to prevent uncontrolled memory growth.

#### TTL on All Cache Keys

**Pattern**: Always set expiration time on cache keys, supported by appropriate eviction policy.

**Template**:
```python
# Always set TTL
r.setex('key', 3600, 'value')  # TTL: 3600 seconds
r.expire('key', 3600)  # Set TTL on existing key

# With eviction policy
# redis.conf: maxmemory-policy volatile-lru (or allkeys-lru)
```

**Best Practice**: Proactively set TTL on all cache keys. Use LRU for general caching, LFU for hot key protection. Configure `maxmemory` and `maxmemory-policy` in redis.conf.

**Anti-Pattern**: ❌ Caching without TTL (keys remain indefinitely, causing memory exhaustion). ❌ `noeviction` policy on caches (Redis stops accepting writes when memory full).

**Eviction Policy Selection**:
- `volatile-lru`: Evicts only keys with TTL (dedicated caches)
- `allkeys-lru`: Evicts any key (operational resilience)
- `allkeys-lfu`: Evicts least frequently used (hot key protection)

### Step 10: Infrastructure Co-location

Minimize physical RTT through network topology optimization.

#### Co-location Pattern

**Pattern**: Deploy application and Redis in same network zone, prefer dedicated machines over shared virtual environments.

**Best Practice**: 
- Co-locate in same Docker network or Kubernetes cluster
- Use dedicated physical/bare-metal machines for Redis (reduces hypervisor overhead)
- Measure intrinsic latency baseline with `redis-cli --latency`

**Anti-Pattern**: ❌ High network latency between services (adds RTT overhead). ❌ Congested virtual environments ("noisy neighbor" resource contention).

**Performance Impact**: Co-location reduces network hops and associated delays. Intrinsic latency (kernel/hypervisor constraints) sets baseline performance cap.

## Common Patterns

### Connection Pooling/Multiplexing
Persistent connection reuse eliminates RTT overhead from connection setup. Use connection pools (Python, Go) or multiplexing (Node.js) based on client library capabilities.

### Pipelining for Bulk Operations
Batch independent commands into single network round trip. Amortizes RTT across entire batch, dramatically increasing throughput for bulk operations.

### Lua Scripting with EVALSHA
Pre-load Lua scripts, execute via SHA-1 digest. Combines atomic execution with network efficiency. Pipeline multiple EVALSHA commands for maximum throughput.

### Cache-Aside with Stampede Protection
Check cache, fetch from database on miss, populate cache. Use distributed mutex lock to prevent concurrent database hits when key expires.

### Key Sharding for Hot Keys
Distribute high-traffic key across multiple keys using hash suffix. Enables load distribution across cluster shards, mitigating single-shard bottlenecks.

### SCAN-based Key Iteration
Use SCAN for non-blocking key space iteration. Spreads work over multiple incremental calls, avoiding server blocking from KEYS command.

## Best Practices

1. **Multi-stage Docker builds**: Build in full-featured stage, deploy minimal runtime with only necessary shared libraries for musl compatibility.

2. **Network isolation**: Never expose Redis publicly. Use internal Docker networks or Kubernetes ClusterIP services. Limit access to trusted application containers.

3. **Disable CONFIG command**: Rename or disable CONFIG command in redis.conf to prevent system compromise via RDB file manipulation.

4. **Enable AOF persistence**: Use AOF for critical data durability. Configure `everysec` sync policy for balance of performance and durability. Mount persistent volumes for AOF files.

5. **Use LFU eviction for hot keys**: Configure `maxmemory-policy allkeys-lfu` to protect frequently accessed data from eviction, mitigating hot key issues.

6. **Always set TTL on cache keys**: Proactively set expiration on all cache keys. Use `setex` or `expire` commands. Prevents uncontrolled memory growth.

7. **Co-locate application and Redis**: Deploy in same network zone. Prefer dedicated machines over shared virtual environments to reduce latency and resource contention.

8. **Monitor intrinsic latency**: Measure baseline latency with `redis-cli --latency` to understand infrastructure constraints and set realistic performance expectations.

## Workarounds

### Workaround 1: Multi-Stage Docker Builds
**When**: Application or client libraries require glibc dependencies incompatible with Alpine musl libc.

**Implementation**: Use multi-stage Dockerfile. Build in full-featured stage (python:3.11-slim), copy only runtime artifacts to Alpine runtime stage. Ensures compatibility while maintaining minimal image size.

**Trade-off**: Slightly more complex build process, but maintains Alpine size benefits without runtime compatibility issues.

### Workaround 2: Client-Side Caching for Hot Keys
**When**: Single key receives disproportionate read traffic (read-heavy hot key), overwhelming single shard in cluster.

**Implementation**: Implement local application cache (in-memory, TTL-based) for hot keys. Check local cache before Redis query. Reduces Redis load for frequently accessed data.

**Trade-off**: Adds application memory usage and potential cache inconsistency. Suitable for read-heavy, eventually consistent data.

### Workaround 3: Key Sharding
**When**: Single key receives disproportionate traffic, creating bottleneck even in cluster (key always routes to one shard).

**Implementation**: Append hash suffix to base key (e.g., `user:123:profile:shard:5`). Distribute requests across multiple keys and shards. Use consistent hashing for deterministic shard selection.

**Trade-off**: Adds complexity to key management and retrieval (must query all shards or maintain shard mapping). Effective for write-heavy hot keys.

### Workaround 4: MEMORY PURGE for Fragmentation
**When**: High memory fragmentation ratio (>1.5) reduces effective capacity after bulk data removal.

**Implementation**: Execute `MEMORY PURGE` command (Redis 4+) to force release of unused memory. Monitor `mem_fragmentation_ratio` via `INFO memory`.

**Trade-off**: Temporary performance impact during purge operation. Use after bulk deletions or during maintenance windows.

### Workaround 5: Cache Stampede Mutex Lock
**When**: High concurrent cache misses on expired keys cause cascading database load (cache stampede).

**Implementation**: Acquire distributed lock atomically (SET NX EX) before database fetch. Only lock holder regenerates cache. Other clients wait or return stale data. Release lock via Lua script verifying ownership.

**Trade-off**: Adds latency for lock acquisition. Prevents backend overload at cost of slight delay for cache regeneration.

## Anti-Patterns to Avoid

### ❌ KEYS Command Blocking
**Issue**: KEYS command performs O(N) exhaustive pattern matching, blocking entire server until completion.

**Detection**: KEYS command usage in production code or monitoring scripts.

**Resolution**: Use SCAN for key iteration. SCAN spreads work over non-blocking incremental calls. For content-based queries, use Redis Search module.

**Impact**: KEYS on large dataset (millions of keys) can block server for seconds or minutes, rendering Redis unresponsive.

### ❌ Caching Without TTL
**Issue**: Cache keys without expiration remain in memory indefinitely, causing uncontrolled growth and eventual memory exhaustion.

**Detection**: Cache operations without `setex`, `expire`, or TTL parameter.

**Resolution**: Always set TTL on cache keys. Configure appropriate eviction policy (LRU/LFU). Monitor memory usage proactively.

**Impact**: Memory exhaustion leads to eviction sweeps, performance degradation, or service failure when `noeviction` policy set.

### ❌ Hot Keys on Single Shard
**Issue**: Single key or small subset receives disproportionate traffic, overwhelming one shard in cluster while others remain underutilized.

**Detection**: Single shard CPU saturation despite cluster capacity. Monitoring shows uneven key distribution.

**Resolution**: Shard hot key using hash suffix. Distribute requests across multiple keys and shards. Use LFU eviction policy to protect frequently accessed data.

**Impact**: Cluster scaling benefit negated. Single shard becomes bottleneck, limiting overall system throughput.

### ❌ JSON Stored as Strings
**Issue**: Storing JSON as opaque strings requires full deserialize/modify/reserialize cycle for any update, with non-atomic operations.

**Detection**: JSON serialization/deserialization in application code for Redis string values.

**Resolution**: Use HASH data structure for structured mutable data. Enables atomic field-level updates. Alternative: RedisJSON module for native JSON manipulation.

**Impact**: Inefficient updates, requires application-side locking (WATCH/MULTI/EXEC) for atomicity, adds complexity and potential race conditions.

### ❌ Frequent Connection Open/Close
**Issue**: Opening and closing TCP connections for every command introduces significant RTT overhead, limiting throughput.

**Detection**: Connection creation in request handlers or per-command operations.

**Resolution**: Use connection pooling (Python, Go) or multiplexing (Node.js). Initialize pool/singleton client at application startup, reuse throughout lifecycle.

**Impact**: 250ms RTT limits sequential operations to ~4 ops/sec. Connection pooling eliminates this overhead, enabling thousands of ops/sec.

### ❌ musl/glibc Compatibility Issues
**Issue**: Applications compiled expecting glibc behaviors fail in Alpine containers using musl libc.

**Detection**: Runtime errors related to missing symbols, NSS features, or C library incompatibilities.

**Resolution**: Use multi-stage Docker builds. Build in full-featured stage with glibc, copy only runtime artifacts to Alpine stage. Inspect and copy necessary shared libraries.

**Impact**: Application crashes or unexpected behavior in production. Multi-stage builds maintain Alpine size benefits while ensuring compatibility.

### ❌ Public Redis Exposure
**Issue**: Redis exposed to public internet allows exploitation attempts, unauthorized access, and system compromise.

**Detection**: Redis ports exposed via NodePort, LoadBalancer, or public Docker ports.

**Resolution**: Use internal networks only. Docker: internal networks. Kubernetes: ClusterIP services. Never expose Redis ports publicly.

**Impact**: Security vulnerability allowing unauthorized access, data exposure, and potential system compromise via CONFIG command exploitation.

### ❌ CONFIG Command Enabled
**Issue**: CONFIG command allows arbitrary changes to working directory and dump file name, enabling system compromise via RDB file writes to critical locations.

**Detection**: CONFIG command not disabled or renamed in redis.conf.

**Resolution**: Disable CONFIG command: `rename-command CONFIG ""` in redis.conf. If renaming required, use cryptographically secure random string.

**Impact**: Critical security vulnerability. Attacker can write RDB files to cron directories or authorized_keys files, executing code under Redis user permissions.

## Code Templates

### Connection Pooling Setup (Python)
```python
import redis

POOL = redis.ConnectionPool(
    host='redis',
    port=6379,
    max_connections=50,
    decode_responses=True
)

r = redis.Redis(connection_pool=POOL)
```

### Connection Multiplexing (Node.js)
```javascript
const client = redis.createClient({ url: 'redis://redis:6379' });
await client.connect();
```

### Pipelining Template (Python)
```python
pipe = r.pipeline()
for key, value in items:
    pipe.set(key, value)
results = pipe.execute()
```

### Lua Script Pre-loading and EVALSHA (Go)
```go
sha, _ := client.ScriptLoad(ctx, luaScript).Result()
result, _ := client.EvalSha(ctx, sha, []string{"key"}, args).Result()
```

### Cache Stampede Mutex (Command Template)
```bash
# Lock acquisition
SET cache_key:lock {unique_id} NX EX 30

# Lock release (Lua script)
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
```

### Key Sharding Template
```python
import hashlib
shard = int(hashlib.md5(key.encode()).hexdigest(), 16) % shard_count
sharded_key = f"{key}:shard:{shard}"
```

### SCAN Iteration Template
```python
cursor = 0
while True:
    cursor, keys = r.scan(cursor, match='pattern:*', count=100)
    # Process keys
    if cursor == 0:
        break
```

### HASH Data Structure Template
```python
r.hset('key', mapping={'field1': 'value1', 'field2': 'value2'})
r.hset('key', 'field1', 'new_value')  # Atomic field update
data = r.hgetall('key')
```

### Multi-Stage Dockerfile Template
```dockerfile
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM redis:7-alpine
RUN apk add --no-cache python3
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
```

### Security Configuration Template
```bash
# redis.conf
bind 0.0.0.0
protected-mode yes
requirepass {secure_password}
rename-command CONFIG ""
appendonly yes
appendfsync everysec
```

## Real-World Examples

### Example 1: Containerized Cache-Aside with Stampede Protection

**Context**: Microservice in Kubernetes caching user sessions with Redis 7-Alpine. High concurrent access requires stampede protection.

**Minimal Code**:
```python
import redis
import uuid
import time

pool = redis.ConnectionPool(host='redis-service', port=6379, max_connections=50)
r = redis.Redis(connection_pool=pool)

def get_user_session(user_id):
    key = f"session:{user_id}"
    cached = r.get(key)
    if cached:
        return cached
    
    lock_key = f"{key}:lock"
    lock_id = str(uuid.uuid4())
    
    if r.set(lock_key, lock_id, nx=True, ex=10):
        try:
            session = fetch_session_from_db(user_id)
            r.setex(key, 3600, session)
            return session
        finally:
            r.eval("if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end", 1, lock_key, lock_id)
    else:
        time.sleep(0.1)
        return r.get(key) or fetch_session_from_db(user_id)
```

**Key Points**: Connection pool for container networking, atomic lock acquisition prevents stampede, safe lock release via Lua script, fallback to database if lock acquisition fails.

### Example 2: High-Performance Bulk Data Loading

**Context**: Initializing Redis cache from database in containerized environment. Bulk loading 10,000 records efficiently.

**Minimal Code**:
```python
import redis

pool = redis.ConnectionPool(host='redis-service', port=6379, max_connections=50)
r = redis.Redis(connection_pool=pool)

def bulk_load_cache(records):
    pipe = r.pipeline()
    for record in records:
        pipe.setex(f"item:{record.id}", 3600, record.data)
    pipe.execute()  # Single network round trip for all 10,000 records
```

**Key Points**: Pipelining batches all SET operations into single network round trip, connection reuse via pool, container resource limits considered (batch size adjustable), TTL set on all keys.

## Error Handling

**Connection Pool Exhaustion in Containers**:
- **Detection**: Monitor pool usage, alert at 80% capacity. Check container resource limits.
- **Resolution**: Increase `max_connections` in pool configuration. Scale pool size based on load formula. Verify container memory/CPU limits allow additional connections.
- **Prevention**: Proactive pool sizing, load testing before production, monitor connection metrics.

**Memory Pressure in Constrained Environments**:
- **Detection**: Monitor memory usage via `INFO memory`. Check container memory limits and eviction policy triggers.
- **Resolution**: Adjust `maxmemory` configuration, increase container memory limits, configure appropriate eviction policy (LRU/LFU). Set TTL on all keys.
- **Prevention**: Proactive memory reservation configuration, monitor memory fragmentation ratio, use MEMORY PURGE after bulk operations.

**musl/glibc Compatibility Errors**:
- **Detection**: Runtime errors: "symbol not found", "undefined reference", NSS-related failures.
- **Resolution**: Use multi-stage Docker builds. Build in glibc environment, copy only runtime libraries to Alpine. Inspect dependencies with `ldd` command.
- **Prevention**: Test application in Alpine containers during development. Use multi-stage builds from start.

**Network Isolation Failures**:
- **Detection**: Redis accessible from unauthorized networks, connection attempts from external sources.
- **Resolution**: Verify Docker network configuration (internal: true). In Kubernetes, ensure ClusterIP service type. Review firewall rules and security groups.
- **Prevention**: Network policies, internal-only service configuration, regular security audits.

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in SKILL.md or scripts
- ✅ Use external credential management systems (Kubernetes secrets, Docker secrets)
- ✅ Route sensitive operations through secure channels

**Operational Constraints**:
- Use connection pooling with authentication (`requirepass` in redis.conf)
- Secure network channels (TLS) for production (Redis 6+ supports TLS)
- Implement proper access controls (Redis ACLs, network policies)
- Monitor for unauthorized access attempts
- Never expose Redis ports publicly (use internal networks only)
- Disable or rename CONFIG command to prevent system compromise

**Container Security**:
- Run Redis as non-root user in containers
- Use read-only root filesystem where possible
- Limit container capabilities (drop unnecessary capabilities)
- Use security contexts in Kubernetes
- Regularly update base images for security patches

## Dependencies

This skill requires the following packages (listed in frontmatter):
- `redis>=7.0.0`: Redis server version 7 or higher
- `redis-py>=5.0.0`: Python Redis client with connection pooling and advanced features

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment. The skill cannot install packages at runtime.

**Client Library Alternatives**:
- Node.js: `redis` or `ioredis` packages
- Go: `github.com/redis/go-redis/v9`
- Java: `jedis` or `lettuce`

## Performance Considerations

**Container Resource Limits**:
- Configure appropriate CPU and memory limits for Redis containers
- Monitor resource usage and adjust limits based on load
- Consider dedicated nodes for Redis in Kubernetes (node selectors, taints/tolerations)

**Network RTT in Containerized Environments**:
- Co-locate application and Redis in same network zone
- Use internal Docker networks or Kubernetes cluster networking
- Measure intrinsic latency with `redis-cli --latency` to set baseline expectations
- Minimize network hops between services

**Single-Threaded Architecture Constraints**:
- Any lengthy operation blocks all clients
- Control command time complexity strictly (avoid O(N) operations)
- Use SCAN instead of KEYS, limit range queries
- Monitor slow log for blocking operations

**Alpine Image Size Benefits**:
- Minimal base image (~5MB) enables faster image pulls
- Reduced storage overhead in container registries
- Smaller attack surface compared to full-featured images
- Faster container startup times

**Intrinsic Latency Measurement**:
- Use `redis-cli --latency` to measure baseline latency
- Provides realistic cap on achievable performance
- Accounts for kernel and hypervisor constraints
- Helps set realistic performance expectations

## Related Resources

For extensive reference materials, see:
- `templates/docker-compose.template`: Docker Compose configuration template
- `templates/redis-alpine.conf.template`: Redis configuration template for Alpine deployments

## Notes

- Redis 7-Alpine uses musl libc, requiring multi-stage builds for applications with glibc dependencies
- Containerized deployments benefit from Alpine's minimal footprint but require careful compatibility planning
- Network isolation is critical: never expose Redis publicly in containerized environments
- Connection pooling/multiplexing is mandatory for production containerized deployments to overcome RTT limitations
- AOF persistence requires persistent volume mounts in ephemeral container environments
- Hot keys cannot be resolved by sharding alone in clusters; architectural workarounds (client-side caching, key sharding) required
- Single-threaded architecture means any blocking operation affects all clients; strict command complexity control required
- Alpine image size benefits (faster pulls, reduced storage) must be balanced against musl/glibc compatibility considerations

