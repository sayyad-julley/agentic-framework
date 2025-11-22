# Redis Production Implementation

Production-ready Redis implementation following best practices, patterns, and avoiding anti-patterns from the `implementing-redis-production` and `implementing-redis-7-alpine-containerized` skill documents.

## Overview

This project demonstrates production-ready Redis implementations including:

- **Connection Pooling**: Reuse connections to eliminate RTT overhead
- **SCAN Pattern**: Non-blocking key iteration instead of blocking KEYS command
- **TTL on Cache Keys**: Always set expiration to prevent memory exhaustion
- **HASH Data Structure**: Use HASH instead of JSON strings for structured mutable data
- **Hot Key Sharding**: Distribute hot key traffic across multiple keys and shards
- **Cache Stampede Protection**: Distributed mutex locks to prevent concurrent database hits
- **Pipelining**: Batch commands for single network round trip
- **Lua Scripting with EVALSHA**: Pre-load scripts for efficient atomic operations

## Prerequisites

- **Redis 7+** installed locally
- **Python 3.11+**
- **redis-py** library (installed via requirements.txt)

## Installation

### 1. Install Redis

#### macOS (using Homebrew)
```bash
brew install redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
```

#### Linux (CentOS/RHEL)
```bash
sudo yum install redis
```

#### Windows
Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or use WSL2.

#### From Source
```bash
wget https://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
sudo make install
```

### 2. Install Python Dependencies

```bash
cd redis-demo
pip install -r requirements.txt
```

### 3. Start Redis Server

```bash
# Start Redis server (default port 6379)
redis-server

# Or with custom configuration
redis-server redis.conf

# Or run in background (macOS/Linux)
redis-server --daemonize yes
```

### 4. Verify Redis is Running

```bash
# Test connection
redis-cli ping
# Should return: PONG

# Or check if Redis is listening
redis-cli info server
```

## Quick Start

### 1. Start Redis Server

In a terminal, start Redis:
```bash
redis-server
```

Or use the provided configuration:
```bash
redis-server redis.conf
```

### 2. Run All Examples

In another terminal:
```bash
cd redis-demo
python src/examples/main.py
```

### 3. Run Individual Pattern Examples

```bash
# Connection pooling
python src/connection_pool.py

# SCAN pattern (non-blocking key iteration)
python src/scan_pattern.py

# TTL on cache keys
python src/ttl_cache.py

# HASH data structure
python src/hash_structure.py

# Hot key sharding
python src/hot_key_sharding.py

# Cache stampede protection
python src/cache_stampede.py

# Pipelining
python src/pipelining.py

# Lua scripting with EVALSHA
python src/lua_scripting.py
```

### 4. Use Redis CLI

```bash
# Connect to Redis CLI
redis-cli

# Try these commands:
# Check memory usage
INFO memory

# Check slow log
SLOWLOG GET 10

# Check latency
--latency

# Scan keys
SCAN 0 MATCH demo:*

# Get a key
GET demo:connection

# Exit CLI
exit
```

## Patterns Implemented

### 1. Connection Pooling Pattern

**Best Practice**: Initialize connection pool at application startup, reuse throughout lifecycle.

**Key Features:**
- Single connection pool shared across application
- Eliminates RTT overhead from connection setup
- Enables thousands of ops/sec instead of ~4 ops/sec with frequent connect/disconnect

**Anti-Patterns Avoided:**
- ❌ Opening/closing connections per command (introduces 250ms+ RTT overhead)
- ❌ Default pool sizes without load testing (causes exhaustion under load)

**File**: `src/connection_pool.py`

### 2. SCAN Pattern (instead of KEYS)

**Best Practice**: Use SCAN for non-blocking key iteration. Spreads work over incremental calls.

**Key Features:**
- Non-blocking iteration over key space
- Incremental cursor-based scanning
- Generator support for memory-efficient iteration

**Anti-Patterns Avoided:**
- ❌ KEYS command (O(N) complexity, blocks entire server)
- ❌ Unbounded range queries (ZRANGE 0 -1 blocks server)

**File**: `src/scan_pattern.py`

### 3. TTL on Cache Keys

**Best Practice**: Always set TTL on cache keys. Configure appropriate eviction policy (LRU/LFU).

**Key Features:**
- Atomic set + expire with `setex`
- Cache-Aside pattern with TTL
- Batch TTL operations with pipeline

**Anti-Patterns Avoided:**
- ❌ Caching without TTL (keys remain indefinitely, causing memory exhaustion)
- ❌ `noeviction` policy on caches (Redis stops accepting writes when memory full)

**File**: `src/ttl_cache.py`

### 4. HASH Data Structure

**Best Practice**: Use HASH for structured mutable data. Enables atomic field-level updates.

**Key Features:**
- Atomic field updates without full object transfer
- Single atomic fetch with `hgetall`
- Efficient single field retrieval with `hget`

**Anti-Patterns Avoided:**
- ❌ Storing JSON as opaque strings (requires full deserialize/modify/reserialize cycle)
- ❌ Non-atomic operations requiring application-side locking (WATCH/MULTI/EXEC)

**File**: `src/hash_structure.py`

### 5. Hot Key Sharding

**Best Practice**: Shard hot key using hash suffix. Distribute requests across multiple keys and shards.

**Key Features:**
- Consistent hashing for deterministic shard selection
- Distributes load across cluster shards
- Supports both read and write operations

**Anti-Patterns Avoided:**
- ❌ Single key handling high traffic (overwhelms single shard in cluster)
- ❌ Using LRU instead of LFU for hot keys (LRU evicts based on recency, not frequency)

**File**: `src/hot_key_sharding.py`

### 6. Cache Stampede Protection

**Best Practice**: Use distributed mutex lock (SET NX EX) before database fetch. Only lock holder regenerates cache.

**Key Features:**
- Atomic lock acquisition prevents concurrent database hits
- Safe lock release via Lua script (verifies ownership)
- Retry logic with exponential backoff

**Anti-Patterns Avoided:**
- ❌ No protection against cache stampede (concurrent database hits overwhelm backend)
- ❌ Non-atomic lock acquisition (race conditions)

**File**: `src/cache_stampede.py`

### 7. Pipelining

**Best Practice**: Batch multiple independent commands into single network round trip.

**Key Features:**
- Amortizes RTT across entire batch
- Dramatically increases throughput (100 commands: sequential = 25s, pipelined = ~250ms)
- Supports transactions (MULTI/EXEC) for atomicity

**Anti-Patterns Avoided:**
- ❌ Sequential command execution (RTT limits throughput)
- ❌ Not using pipelining for bulk operations

**File**: `src/pipelining.py`

### 8. Lua Scripting with EVALSHA

**Best Practice**: Pre-load Lua scripts at application startup. Use EVALSHA instead of EVAL.

**Key Features:**
- Reduces network bandwidth (script sent once, executed via SHA-1 digest)
- Atomic execution (no other command interrupts until completion)
- Combine with pipelining for maximum throughput

**Anti-Patterns Avoided:**
- ❌ Sending full script with every execution (wastes bandwidth)
- ❌ Sequential command execution (RTT limits throughput)

**File**: `src/lua_scripting.py`

## Project Structure

```
redis-demo/
├── redis.conf                  # Production-ready Redis configuration (optional)
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── QUICKSTART.md               # Quick start guide
├── start-redis.sh              # Helper script to start Redis
├── check-redis.sh              # Helper script to check Redis status
├── docker-compose.yml          # Docker setup (optional, for reference)
├── Dockerfile                  # Docker build file (optional, for reference)
└── src/
    ├── connection_pool.py      # Connection pooling pattern
    ├── scan_pattern.py         # SCAN instead of KEYS pattern
    ├── ttl_cache.py            # TTL on cache keys pattern
    ├── hash_structure.py       # HASH data structure pattern
    ├── hot_key_sharding.py     # Hot key sharding pattern
    ├── cache_stampede.py       # Cache stampede protection pattern
    ├── pipelining.py           # Pipelining pattern
    ├── lua_scripting.py        # Lua scripting with EVALSHA pattern
    └── examples/
        └── main.py             # Main entry point running all examples
```

## Configuration

### Redis Configuration (`redis.conf`)

The provided `redis.conf` includes production-ready settings:
- **Memory**: `maxmemory 2gb`, `maxmemory-policy allkeys-lfu`
- **Persistence**: AOF enabled with `appendfsync everysec`
- **Security**: CONFIG command disabled (for production)
- **Performance**: Slow log threshold 10ms, latency monitoring 100ms

To use the configuration:
```bash
redis-server redis.conf
```

### Connection Pool Configuration

Pool sizing formula:
```python
pool_size = (concurrent_requests * avg_duration_ms) / 1000 * 1.5
```

Default: 50 connections (adjust based on load)

All examples use `localhost:6379` by default. To change:
- Modify `POOL = ConnectionPool(host='localhost', port=6379, ...)` in each file
- Or set environment variables: `REDIS_HOST` and `REDIS_PORT`

## Best Practices Checklist

### Connection Management
- ✅ Connection pooling initialized at application startup
- ✅ Pool size based on concurrent load formula
- ✅ Health check interval configured
- ✅ Connection reuse throughout application lifecycle

### Key Operations
- ✅ SCAN used instead of KEYS for key iteration
- ✅ TTL set on all cache keys
- ✅ HASH used for structured mutable data
- ✅ Hot keys sharded across multiple keys

### Performance
- ✅ Pipelining for bulk operations
- ✅ Lua scripts pre-loaded and executed via EVALSHA
- ✅ Cache stampede protection with distributed locks

### Security
- ✅ Redis configured with security best practices
- ✅ CONFIG command disabled (in production)
- ✅ Protected mode enabled
- ✅ AOF persistence enabled

### Memory Management
- ✅ TTL on all cache keys
- ✅ LFU eviction policy for hot key protection
- ✅ Memory reservations configured

## Anti-Patterns Avoided

This demo explicitly avoids the following anti-patterns:

1. **KEYS Command Blocking**: Uses SCAN instead
2. **Caching Without TTL**: All cache keys have expiration
3. **Hot Keys on Single Shard**: Hot keys are sharded
4. **JSON Stored as Strings**: Uses HASH data structure
5. **Frequent Connection Open/Close**: Uses connection pooling
6. **Public Redis Exposure**: Local Redis only (configure network security for production)
7. **CONFIG Command Enabled**: CONFIG command disabled in redis.conf
8. **Cache Stampede**: Distributed mutex locks implemented

## Performance Considerations

- **Connection Pooling**: Eliminates 250ms+ RTT overhead, enabling thousands of ops/sec
- **Pipelining**: 100 commands: sequential = 25s, pipelined = ~250ms
- **SCAN**: Non-blocking iteration, allows Redis to serve other clients between batches
- **HASH**: Atomic field updates without full object transfer
- **Lua Scripts**: Atomic execution, reduced network bandwidth with EVALSHA

## Monitoring

### Key Metrics to Monitor

- **Connection Pool Usage**: Alert at 80% capacity
- **Memory Usage**: Monitor `INFO memory`, check eviction policy triggers
- **Slow Log**: Commands slower than 10ms threshold
- **Latency**: Monitor commands slower than 100ms
- **Fragmentation**: Monitor `mem_fragmentation_ratio` (use MEMORY PURGE if > 1.5)

### Redis CLI Monitoring

```bash
# Check memory usage
redis-cli INFO memory

# Check slow log
redis-cli SLOWLOG GET 10

# Check latency
redis-cli --latency

# Check fragmentation
redis-cli INFO memory | grep fragmentation

# Monitor real-time commands
redis-cli MONITOR
```

## Troubleshooting

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running, start Redis
redis-server

# Check Redis logs (if running with config)
tail -f /var/log/redis/redis-server.log
```

### Port Already in Use

If port 6379 is already in use:
```bash
# Find process using port 6379
lsof -i :6379  # macOS/Linux
netstat -ano | findstr :6379  # Windows

# Start Redis on different port
redis-server --port 6380

# Update Python code to use new port
# POOL = ConnectionPool(host='localhost', port=6380, ...)
```

### Python Import Errors

```bash
# Install dependencies
pip install -r requirements.txt

# Or install redis-py directly
pip install redis>=5.0.0
```

## Error Handling

### Connection Pool Exhaustion
- **Detection**: Monitor pool usage, alert at 80% capacity
- **Resolution**: Increase `max_connections` in pool configuration
- **Prevention**: Proactive pool sizing, load testing

### Memory Pressure
- **Detection**: Monitor memory usage via `INFO memory`
- **Resolution**: Adjust `maxmemory`, configure eviction policy, set TTL on keys
- **Prevention**: Proactive memory reservation, monitor fragmentation

### Cache Stampede
- **Detection**: Monitor concurrent database hits on cache misses
- **Resolution**: Implement distributed mutex locks
- **Prevention**: Lock acquisition before database fetch, safe lock release

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:

- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in configuration files
- ✅ Use external credential management systems
- ✅ Route sensitive operations through secure channels

**Operational Constraints:**
- Use connection pooling with authentication (`requirepass` in redis.conf for production)
- Secure network channels (TLS) for production (Redis 6+ supports TLS)
- Implement proper access controls (Redis ACLs, network policies)
- Monitor for unauthorized access attempts
- For production, configure firewall rules to restrict Redis access
- Disable or rename CONFIG command to prevent system compromise

## Related Resources

- [Implementing Redis Production Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-redis-production/SKILL.md)
- [Implementing Redis 7-Alpine Containerized Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-redis-7-alpine-containerized/SKILL.md)
- [Redis Official Documentation](https://redis.io/docs/)
- [redis-py Documentation](https://redis-py.readthedocs.io/)
- [Redis Download](https://redis.io/download)

## Notes

- **Single-Threaded Architecture**: Any lengthy operation blocks all clients. Control command time complexity strictly.
- **Connection Pooling**: Mandatory for production to overcome RTT limitations
- **SCAN vs KEYS**: SCAN spreads work over non-blocking incremental calls, allowing Redis to serve other clients
- **TTL on All Keys**: Prevents uncontrolled memory growth and eviction sweeps
- **HASH vs JSON Strings**: HASH enables atomic field-level updates without full object transfer
- **Hot Key Sharding**: Distributes traffic across multiple keys and shards, mitigating single-shard bottlenecks
- **Cache Stampede Protection**: Distributed mutex locks prevent concurrent database hits on cache expiration
- **Pipelining**: Dramatically increases throughput by batching commands into single network round trip
- **Lua Scripting**: Atomic execution with reduced network bandwidth via EVALSHA
