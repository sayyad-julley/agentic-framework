"""
HASH Data Structure Pattern (Correct Pattern)
Demonstrates using HASH instead of JSON strings for structured mutable data.

Anti-Pattern Avoided: Storing JSON as opaque strings requires full deserialize/modify/
reserialize cycle for any update, with non-atomic operations. This requires application-
side locking (WATCH/MULTI/EXEC) for atomicity, adding complexity and potential race conditions.

Best Practice: Use HASH data structure for structured mutable data. Enables atomic field-
level updates without full object transfer. Alternative: RedisJSON module for native JSON
manipulation.
"""

import redis
from redis.connection import ConnectionPool

POOL = ConnectionPool(host='localhost', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=POOL)


def store_user_hash(user_id, user_data):
    """
    Store user data as HASH (correct pattern).
    Enables atomic field-level updates.
    """
    key = f'user:{user_id}'
    r.hset(key, mapping=user_data)
    # Set TTL on the hash
    r.expire(key, 3600)
    print(f'Stored user {user_id} as HASH')


def update_user_field(user_id, field, value):
    """
    Atomic field update using HASH (no full object transfer required).
    """
    key = f'user:{user_id}'
    r.hset(key, field, value)
    print(f'Updated {field} for user {user_id}')


def get_user_hash(user_id):
    """
    Retrieve entire user hash in single atomic operation.
    """
    key = f'user:{user_id}'
    return r.hgetall(key)


def get_user_field(user_id, field):
    """
    Retrieve single field from hash (efficient, no full object transfer).
    """
    key = f'user:{user_id}'
    return r.hget(key, field)


def increment_user_field(user_id, field, increment=1):
    """
    Atomic increment on hash field.
    """
    key = f'user:{user_id}'
    return r.hincrby(key, field, increment)


# Example usage
if __name__ == '__main__':
    # Store user as HASH
    user_data = {
        'name': 'John Doe',
        'email': 'john@example.com',
        'age': '30',
        'score': '100'
    }
    store_user_hash(123, user_data)
    
    # Atomic field update (no full object transfer)
    update_user_field(123, 'age', '31')
    
    # Retrieve entire hash
    user = get_user_hash(123)
    print(f'User hash: {user}')
    
    # Retrieve single field (efficient)
    email = get_user_field(123, 'email')
    print(f'Email: {email}')
    
    # Atomic increment
    new_score = increment_user_field(123, 'score', 10)
    print(f'New score: {new_score}')
    
    # Compare with anti-pattern (JSON string - shown for reference only)
    # Anti-pattern: Requires full deserialize/modify/reserialize
    # json_data = json.dumps(user_data)
    # r.set('user:123:json', json_data)  # ❌ Anti-pattern
    # # To update: fetch, deserialize, modify, serialize, write (non-atomic)
    # current = json.loads(r.get('user:123:json'))
    # current['age'] = 31
    # r.set('user:123:json', json.dumps(current))  # ❌ Non-atomic, requires locking

