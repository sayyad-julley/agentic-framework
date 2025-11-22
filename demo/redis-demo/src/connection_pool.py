"""
Connection Pooling Pattern
Demonstrates correct connection pooling to avoid frequent connection open/close overhead.

Best Practice: Initialize connection pool at application startup, reuse throughout lifecycle.
This eliminates RTT overhead from connection setup, enabling thousands of ops/sec.
"""

import redis
from redis.connection import ConnectionPool


# Create connection pool (initialize once at application startup)
POOL = ConnectionPool(
    host='localhost',  # Local Redis server
    port=6379,
    db=0,
    max_connections=50,  # Size based on concurrent load
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
    retry_on_timeout=True,
    health_check_interval=30
)


def get_redis_client():
    """
    Get Redis client from connection pool.
    Reuses existing connections, eliminating connection setup overhead.
    """
    return redis.Redis(connection_pool=POOL)


# Example usage
if __name__ == '__main__':
    r = get_redis_client()
    
    # Multiple operations reuse the same connection pool
    r.set('pool_key', 'pool_value')
    value = r.get('pool_key')
    print(f'Value from connection pool: {value}')
    
    # Connection pool is shared across multiple clients
    r1 = get_redis_client()
    r2 = get_redis_client()
    
    r1.set('shared_key', 'value_from_r1')
    print(f'Value from r2: {r2.get("shared_key")}')  # 'value_from_r1'

