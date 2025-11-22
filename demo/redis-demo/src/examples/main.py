"""
Main entry point for Redis demo examples.
Demonstrates all correct patterns for Redis production usage.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from connection_pool import get_redis_client
from scan_pattern import scan_keys
from ttl_cache import cache_with_ttl, cache_aside_with_ttl
from hash_structure import store_user_hash, update_user_field, get_user_hash
from hot_key_sharding import set_sharded_value, get_sharded_value
from cache_stampede import cache_aside_with_lock
from pipelining import bulk_set_with_pipeline
from lua_scripting import check_rate_limit, conditional_update


def main():
    """Run all Redis pattern examples."""
    print("=" * 60)
    print("Redis Production Patterns Demo")
    print("=" * 60)
    print()
    
    r = get_redis_client()
    
    # Test connection
    try:
        r.ping()
        print("✓ Connected to Redis")
    except Exception as e:
        print(f"✗ Failed to connect to Redis: {e}")
        return
    
    print("\n" + "=" * 60)
    print("1. Connection Pooling")
    print("=" * 60)
    print("Using connection pool to avoid connection overhead...")
    r.set('demo:connection', 'pooled')
    print(f"Value: {r.get('demo:connection')}")
    
    print("\n" + "=" * 60)
    print("2. SCAN Pattern (instead of KEYS)")
    print("=" * 60)
    print("Scanning keys with SCAN (non-blocking)...")
    # Create some test keys
    for i in range(5):
        r.setex(f'demo:scan:{i}', 300, f'value_{i}')
    keys = scan_keys('demo:scan:*')
    print(f"Found {len(keys)} keys: {keys}")
    
    print("\n" + "=" * 60)
    print("3. TTL on Cache Keys")
    print("=" * 60)
    print("Setting cache with TTL...")
    cache_with_ttl('demo:cache', {'data': 'cached_value'}, ttl_seconds=3600)
    cached = r.get('demo:cache')
    print(f"Cached value: {cached}")
    
    print("\n" + "=" * 60)
    print("4. HASH Data Structure")
    print("=" * 60)
    print("Using HASH for structured data...")
    store_user_hash(999, {'name': 'Demo User', 'email': 'demo@example.com'})
    update_user_field(999, 'name', 'Updated Demo User')
    user = get_user_hash(999)
    print(f"User hash: {user}")
    
    print("\n" + "=" * 60)
    print("5. Hot Key Sharding")
    print("=" * 60)
    print("Sharding hot key...")
    set_sharded_value('demo:hot:key', 'sharded_value', shard_count=10)
    value = get_sharded_value('demo:hot:key')
    print(f"Sharded value: {value}")
    
    print("\n" + "=" * 60)
    print("6. Cache Stampede Protection")
    print("=" * 60)
    print("Cache-Aside with lock protection...")
    def fetch_data():
        return {'id': 1, 'data': 'fetched_from_source'}
    data = cache_aside_with_lock('demo:stampede', fetch_data, ttl=3600)
    print(f"Cached data: {data}")
    
    print("\n" + "=" * 60)
    print("7. Pipelining")
    print("=" * 60)
    print("Bulk operations with pipeline...")
    items = [(f'demo:pipeline:{i}', {'id': i}) for i in range(10)]
    bulk_set_with_pipeline(items, ttl=300)
    print("Bulk set completed")
    
    print("\n" + "=" * 60)
    print("8. Lua Scripting with EVALSHA")
    print("=" * 60)
    print("Rate limiting with Lua script...")
    for i in range(3):
        allowed = check_rate_limit('demo:user', limit=5, window=60)
        print(f"Request {i+1}: {'Allowed' if allowed else 'Rate limited'}")
    
    print("\n" + "=" * 60)
    print("All examples completed successfully!")
    print("=" * 60)


if __name__ == '__main__':
    main()

