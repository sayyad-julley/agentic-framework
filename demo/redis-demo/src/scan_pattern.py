"""
SCAN Pattern (Correct Pattern)
Demonstrates using SCAN instead of KEYS for non-blocking key iteration.

Anti-Pattern Avoided: KEYS command performs O(N) exhaustive pattern matching,
blocking entire server until completion. On large datasets (millions of keys),
KEYS can block server for seconds or minutes, rendering Redis unresponsive.

Best Practice: Use SCAN for key iteration. SCAN spreads work over non-blocking
incremental calls, allowing Redis to serve other clients between iterations.
"""

import redis
from redis.connection import ConnectionPool

POOL = ConnectionPool(host='localhost', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=POOL)


def scan_keys(pattern='*', count=100):
    """
    Scan keys matching pattern using non-blocking SCAN command.
    
    Args:
        pattern: Key pattern to match (e.g., 'user:*')
        count: Approximate number of keys to return per iteration
    
    Returns:
        List of matching keys
    """
    keys = []
    cursor = 0
    
    while True:
        # SCAN returns cursor and batch of keys
        cursor, batch = r.scan(cursor, match=pattern, count=count)
        keys.extend(batch)
        
        # Cursor 0 indicates scan complete
        if cursor == 0:
            break
    
    return keys


def scan_keys_generator(pattern='*', count=100):
    """
    Generator version of scan_keys for memory-efficient iteration.
    Yields keys one batch at a time instead of collecting all keys.
    """
    cursor = 0
    
    while True:
        cursor, batch = r.scan(cursor, match=pattern, count=count)
        
        for key in batch:
            yield key
        
        if cursor == 0:
            break


# Example usage
if __name__ == '__main__':
    # Create some test keys
    for i in range(10):
        r.setex(f'user:{i}', 3600, f'user_data_{i}')
    
    # Scan all user keys (non-blocking)
    user_keys = scan_keys('user:*')
    print(f'Found {len(user_keys)} user keys: {user_keys}')
    
    # Memory-efficient iteration
    print('\nScanning with generator:')
    for key in scan_keys_generator('user:*'):
        print(f'  - {key}')

