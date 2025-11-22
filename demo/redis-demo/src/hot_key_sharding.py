"""
Hot Key Sharding Pattern (Correct Pattern)
Demonstrates sharding hot keys to distribute traffic across multiple keys and shards.

Anti-Pattern Avoided: Single key or small subset receives disproportionate traffic,
overwhelming one shard in cluster while others remain underutilized. Cluster scaling
benefit is negated, and single shard becomes bottleneck.

Best Practice: Shard hot key using hash suffix. Distribute requests across multiple
keys and shards. Use LFU eviction policy to protect frequently accessed data.
"""

import redis
from redis.connection import ConnectionPool
import hashlib

POOL = ConnectionPool(host='localhost', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=POOL)


def get_sharded_key(base_key, shard_count=10):
    """
    Generate sharded key using hash suffix.
    
    Args:
        base_key: Original key (e.g., 'user:123:profile')
        shard_count: Number of shards to distribute across
    
    Returns:
        Sharded key (e.g., 'user:123:profile:shard:5')
    """
    hash_val = int(hashlib.md5(base_key.encode()).hexdigest(), 16)
    shard = hash_val % shard_count
    return f"{base_key}:shard:{shard}"


def set_sharded_value(base_key, value, shard_count=10, ttl=3600):
    """
    Set value across sharded keys.
    For write-heavy hot keys, write to all shards.
    """
    sharded_key = get_sharded_key(base_key, shard_count)
    r.setex(sharded_key, ttl, value)
    print(f'Set sharded key: {sharded_key}')
    return sharded_key


def get_sharded_value(base_key, shard_count=10):
    """
    Get value from sharded key.
    For read-heavy hot keys, can implement read from random shard or all shards.
    """
    sharded_key = get_sharded_key(base_key, shard_count)
    return r.get(sharded_key)


def set_sharded_hash(base_key, field, value, shard_count=10, ttl=3600):
    """
    Set hash field across sharded keys.
    """
    sharded_key = get_sharded_key(base_key, shard_count)
    r.hset(sharded_key, field, value)
    r.expire(sharded_key, ttl)
    return sharded_key


def get_sharded_hash_all(base_key, shard_count=10):
    """
    Get all fields from sharded hash.
    """
    sharded_key = get_sharded_key(base_key, shard_count)
    return r.hgetall(sharded_key)


def distribute_hot_key_reads(base_key, shard_count=10):
    """
    For read-heavy hot keys, distribute reads across shards.
    Returns value from one shard (can be extended to read from multiple).
    """
    import random
    # Read from random shard to distribute load
    shard = random.randint(0, shard_count - 1)
    sharded_key = f"{base_key}:shard:{shard}"
    return r.get(sharded_key)


# Example usage
if __name__ == '__main__':
    # Example 1: Shard a hot key
    base_key = 'user:123:profile'
    
    # Set value in sharded key
    sharded_key = set_sharded_value(base_key, 'profile_data', shard_count=10)
    print(f'Sharded key: {sharded_key}')
    
    # Get value from sharded key
    value = get_sharded_value(base_key)
    print(f'Retrieved value: {value}')
    
    # Example 2: Shard hash fields
    set_sharded_hash(base_key, 'name', 'John', shard_count=10)
    set_sharded_hash(base_key, 'email', 'john@example.com', shard_count=10)
    
    hash_data = get_sharded_hash_all(base_key)
    print(f'Sharded hash: {hash_data}')
    
    # Example 3: Distribute reads for read-heavy hot key
    # This would be used when a single key receives many reads
    for i in range(5):
        value = distribute_hot_key_reads('hot:read:key', shard_count=10)
        print(f'Read {i+1}: {value}')

