"""
Lua Scripting with EVALSHA Pattern (Correct Pattern)
Demonstrates pre-loading Lua scripts and executing via EVALSHA for efficiency.

Anti-Pattern Avoided: Sending full script with every execution wastes bandwidth.
Pre-loading scripts and using EVALSHA reduces network overhead and improves performance.

Best Practice: Pre-load scripts at application startup. Use EVALSHA instead of EVAL
to reduce network bandwidth. Combine with pipelining for maximum throughput. Lua
scripts execute atomically - once started, no other command interrupts until completion.
"""

import redis
from redis.connection import ConnectionPool

POOL = ConnectionPool(host='localhost', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=POOL)


# Rate limiting Lua script
RATE_LIMIT_SCRIPT = """
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = redis.call('GET', key)

if current and tonumber(current) >= limit then
    return 0
end

current = redis.call('INCR', key)
if current == 1 then
    redis.call('EXPIRE', key, window)
end

return 1
"""

# Atomic conditional update script
CONDITIONAL_UPDATE_SCRIPT = """
local key = KEYS[1]
local old_val = ARGV[1]
local new_val = ARGV[2]
local current = redis.call('GET', key)

if current == old_val then
    redis.call('SET', key, new_val)
    return 1
end
return 0
"""

# Atomic list move script
LIST_MOVE_SCRIPT = """
local src = KEYS[1]
local dst = KEYS[2]
local value = redis.call('RPOP', src)
if value then
    redis.call('LPUSH', dst, value)
    return value
end
return nil
"""


# Register scripts once at application startup
rate_limit_script = r.register_script(RATE_LIMIT_SCRIPT)
conditional_update_script = r.register_script(CONDITIONAL_UPDATE_SCRIPT)
list_move_script = r.register_script(LIST_MOVE_SCRIPT)


def check_rate_limit(user_id, limit=10, window=60):
    """
    Check rate limit using pre-loaded Lua script.
    Returns True if allowed, False if rate limit exceeded.
    """
    key = f'rate_limit:user:{user_id}'
    result = rate_limit_script(keys=[key], args=[limit, window])
    return bool(result)


def conditional_update(key, old_value, new_value):
    """
    Conditionally update key only if current value matches old_value.
    Returns True if updated, False if value didn't match.
    """
    result = conditional_update_script(keys=[key], args=[old_value, new_value])
    return bool(result)


def move_list_item(source_list, dest_list):
    """
    Atomically move item from source list to destination list.
    Returns moved value or None if source list is empty.
    """
    result = list_move_script(keys=[source_list, dest_list])
    return result


def pipeline_lua_scripts():
    """
    Execute multiple Lua scripts in pipeline for maximum throughput.
    """
    pipe = r.pipeline()
    
    # Execute multiple script calls in pipeline
    rate_limit_script(keys=['rate_limit:user:1'], args=[10, 60], client=pipe)
    rate_limit_script(keys=['rate_limit:user:2'], args=[10, 60], client=pipe)
    conditional_update_script(keys=['config:mode'], args=['dev', 'prod'], client=pipe)
    
    results = pipe.execute()
    return results


# Example usage
if __name__ == '__main__':
    # Example 1: Rate limiting
    print('=== Example 1: Rate Limiting ===')
    for i in range(12):
        allowed = check_rate_limit('user:123', limit=10, window=60)
        if allowed:
            print(f'Request {i+1}: Allowed')
        else:
            print(f'Request {i+1}: Rate limit exceeded')
            break
    
    # Example 2: Conditional update
    print('\n=== Example 2: Conditional Update ===')
    r.set('config:mode', 'development')
    updated = conditional_update('config:mode', 'development', 'production')
    print(f'Updated: {updated}, Value: {r.get("config:mode")}')
    
    # Example 3: Atomic list move
    print('\n=== Example 3: Atomic List Move ===')
    r.rpush('source_list', 'item1', 'item2', 'item3')
    moved = move_list_item('source_list', 'dest_list')
    print(f'Moved: {moved}')
    print(f'Source list: {r.lrange("source_list", 0, -1)}')
    print(f'Dest list: {r.lrange("dest_list", 0, -1)}')
    
    # Example 4: Pipeline Lua scripts
    print('\n=== Example 4: Pipeline Lua Scripts ===')
    results = pipeline_lua_scripts()
    print(f'Pipeline results: {results}')

