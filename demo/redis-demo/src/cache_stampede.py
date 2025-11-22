"""
Cache Stampede Protection Pattern (Correct Pattern)
Demonstrates distributed mutex lock to prevent cache stampede.

Anti-Pattern Avoided: No protection against cache stampede causes concurrent database
hits when key expires, overwhelming backend. Multiple clients regenerate cache
simultaneously, causing cascading failures.

Best Practice: Use atomic lock acquisition (SET NX EX) before database fetch. Only
lock holder regenerates cache. Other clients wait or return stale data. Release
lock via Lua script verifying ownership.
"""

import redis
from redis.connection import ConnectionPool
import uuid
import time
import json

POOL = ConnectionPool(host='localhost', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=POOL)


# Lua script for safe lock release (verifies ownership before delete)
LOCK_RELEASE_SCRIPT = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
"""

# Register Lua script once
release_lock = r.register_script(LOCK_RELEASE_SCRIPT)


def cache_aside_with_lock(key, fetch_func, ttl=3600, lock_ttl=10):
    """
    Cache-Aside pattern with distributed mutex lock to prevent cache stampede.
    
    Args:
        key: Cache key
        fetch_func: Function to fetch data from source (database)
        ttl: Cache TTL in seconds
        lock_ttl: Lock TTL in seconds (should be shorter than expected fetch time)
    
    Returns:
        Cached or freshly fetched data
    """
    # Try cache first
    cached = r.get(key)
    if cached:
        print(f'Cache hit for {key}')
        return json.loads(cached)
    
    # Cache miss: try to acquire lock
    lock_key = f"{key}:lock"
    unique_id = str(uuid.uuid4())
    
    # Atomic lock acquisition (SET NX EX)
    if r.set(lock_key, unique_id, nx=True, ex=lock_ttl):
        try:
            print(f'Lock acquired for {key}, fetching from source...')
            # Fetch from source
            data = fetch_func()
            
            # Populate cache with TTL
            r.setex(key, ttl, json.dumps(data))
            print(f'Cache populated for {key}')
            return data
        finally:
            # Safe lock release (Lua script verifies ownership)
            release_lock(keys=[lock_key], args=[unique_id])
            print(f'Lock released for {key}')
    else:
        # Another process has lock, wait briefly and retry
        print(f'Lock held by another process for {key}, waiting...')
        time.sleep(0.1)
        cached = r.get(key)
        if cached:
            print(f'Cache populated by another process for {key}')
            return json.loads(cached)
        else:
            # Fallback to direct fetch if lock holder failed
            print(f'Fallback: fetching directly for {key}')
            return fetch_func()


def cache_aside_with_lock_retry(key, fetch_func, ttl=3600, lock_ttl=10, max_retries=3):
    """
    Enhanced version with retry logic for lock acquisition.
    """
    for attempt in range(max_retries):
        try:
            return cache_aside_with_lock(key, fetch_func, ttl, lock_ttl)
        except Exception as e:
            if attempt < max_retries - 1:
                print(f'Attempt {attempt + 1} failed: {e}, retrying...')
                time.sleep(0.1 * (attempt + 1))  # Exponential backoff
            else:
                raise


# Example usage
if __name__ == '__main__':
    # Simulate database fetch function
    def fetch_user_profile(user_id):
        print(f'  [DB] Fetching user {user_id} from database...')
        time.sleep(0.5)  # Simulate database latency
        return {
            'id': user_id,
            'name': f'User {user_id}',
            'email': f'user{user_id}@example.com'
        }
    
    # Example 1: Single request
    print('=== Example 1: Single Request ===')
    profile = cache_aside_with_lock('user:123', lambda: fetch_user_profile(123))
    print(f'Profile: {profile}\n')
    
    # Example 2: Concurrent requests (simulated)
    print('=== Example 2: Concurrent Requests (Simulated) ===')
    # First request acquires lock and fetches
    profile1 = cache_aside_with_lock('user:456', lambda: fetch_user_profile(456))
    print(f'Request 1 result: {profile1}\n')
    
    # Second request (simulated) - would get cache hit or wait for lock
    # In real scenario, multiple threads/processes would call this simultaneously
    profile2 = cache_aside_with_lock('user:456', lambda: fetch_user_profile(456))
    print(f'Request 2 result: {profile2}\n')

