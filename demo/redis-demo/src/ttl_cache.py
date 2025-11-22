"""
TTL on Cache Keys Pattern (Correct Pattern)
Demonstrates always setting TTL on cache keys to prevent uncontrolled memory growth.

Anti-Pattern Avoided: Cache keys without expiration remain in memory indefinitely,
causing uncontrolled growth and eventual memory exhaustion. This leads to eviction
sweeps, performance degradation, or service failure when noeviction policy is set.

Best Practice: Always set TTL on cache keys. Configure appropriate eviction policy
(LRU/LFU). Monitor memory usage proactively.
"""

import redis
from redis.connection import ConnectionPool
import json

POOL = ConnectionPool(host='localhost', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=POOL)


def cache_with_ttl(key, value, ttl_seconds=3600):
    """
    Cache value with TTL using setex (atomic set + expire).
    
    Args:
        key: Cache key
        value: Value to cache (will be JSON serialized)
        ttl_seconds: Time to live in seconds (default: 1 hour)
    """
    # setex atomically sets key and expiration
    r.setex(key, ttl_seconds, json.dumps(value))
    print(f'Cached {key} with TTL {ttl_seconds}s')


def cache_with_expire(key, value, ttl_seconds=3600):
    """
    Alternative: Set key first, then expire separately.
    Less efficient than setex but useful when key already exists.
    """
    r.set(key, json.dumps(value))
    r.expire(key, ttl_seconds)
    print(f'Cached {key} with TTL {ttl_seconds}s')


def get_cached(key):
    """
    Retrieve cached value, returns None if expired or not found.
    """
    cached = r.get(key)
    if cached:
        return json.loads(cached)
    return None


def cache_aside_with_ttl(key, fetch_func, ttl_seconds=3600):
    """
    Cache-Aside pattern with TTL.
    Checks cache first, fetches from source on miss, then populates cache with TTL.
    """
    # Try cache first
    cached = get_cached(key)
    if cached:
        print(f'Cache hit for {key}')
        return cached
    
    # Cache miss: fetch from source
    print(f'Cache miss for {key}, fetching from source...')
    data = fetch_func()
    
    # Populate cache with TTL
    cache_with_ttl(key, data, ttl_seconds)
    return data


# Example usage
if __name__ == '__main__':
    # Example 1: Simple cache with TTL
    cache_with_ttl('user:123', {'name': 'John', 'age': 30}, ttl_seconds=3600)
    user_data = get_cached('user:123')
    print(f'Retrieved: {user_data}')
    
    # Example 2: Cache-Aside pattern
    def fetch_user_profile(user_id):
        # Simulate database fetch
        return {'id': user_id, 'name': 'Jane', 'email': 'jane@example.com'}
    
    profile = cache_aside_with_ttl('user:456', lambda: fetch_user_profile(456))
    print(f'Profile: {profile}')
    
    # Example 3: Batch caching with TTL
    pipe = r.pipeline()
    for i in range(5):
        key = f'item:{i}'
        value = {'id': i, 'data': f'item_data_{i}'}
        pipe.setex(key, 300, json.dumps(value))  # 5 minute TTL
    pipe.execute()
    print('Batch cached 5 items with TTL')

