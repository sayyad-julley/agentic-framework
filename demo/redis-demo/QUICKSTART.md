# Redis Demo Quick Start Guide

## Prerequisites

- Redis 7+ installed locally
- Python 3.11+
- Port 6379 available (or modify configuration)

## Quick Start

### 1. Install Redis

#### macOS
```bash
brew install redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
```

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

Keep this terminal open or run Redis in the background.

### 4. Verify Redis is Running

In a new terminal:
```bash
redis-cli ping
# Should return: PONG
```

### 5. Run All Examples

```bash
cd redis-demo
python src/examples/main.py
```

### 6. Run Individual Pattern Examples

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

### 7. Use Redis CLI

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

### 8. Stop Redis Server

If running in foreground, press `Ctrl+C`.

If running in background:
```bash
# Find Redis process
ps aux | grep redis-server

# Stop Redis
redis-cli shutdown

# Or kill process
kill <pid>
```

## What Each Pattern Demonstrates

1. **Connection Pooling**: Reuse connections to eliminate RTT overhead
2. **SCAN Pattern**: Non-blocking key iteration instead of blocking KEYS
3. **TTL on Cache Keys**: Always set expiration to prevent memory exhaustion
4. **HASH Data Structure**: Use HASH instead of JSON strings for structured data
5. **Hot Key Sharding**: Distribute hot key traffic across multiple keys
6. **Cache Stampede Protection**: Distributed mutex locks prevent concurrent DB hits
7. **Pipelining**: Batch commands for single network round trip
8. **Lua Scripting**: Pre-load scripts and execute via EVALSHA

## Troubleshooting

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping

# If not running, start Redis
redis-server

# Check if Redis is listening on port 6379
netstat -an | grep 6379  # macOS/Linux
netstat -an | findstr 6379  # Windows
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
# Change host='localhost', port=6380 in connection_pool.py
```

### Python Import Errors

```bash
# Install dependencies
pip install -r requirements.txt

# Or install redis-py directly
pip install redis>=5.0.0
```

### Redis Not Found

```bash
# Check if Redis is installed
which redis-server  # macOS/Linux
redis-server --version

# If not installed, install Redis (see Installation section above)
```

## Next Steps

- Read the full [README.md](README.md) for detailed pattern explanations
- Review the [Redis Production Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-redis-production/SKILL.md)
- Review the [Redis 7-Alpine Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-redis-7-alpine-containerized/SKILL.md)
- Experiment with Redis CLI commands
- Modify examples to test different scenarios
