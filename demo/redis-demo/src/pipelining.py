"""
Pipelining Pattern (Correct Pattern)
Demonstrates batching multiple commands into single network round trip.

Anti-Pattern Avoided: Sequential command execution limits throughput due to RTT overhead.
100 commands with 250ms RTT: sequential = 25 seconds, pipelined = ~250ms.

Best Practice: Use pipelining for bulk independent operations. Amortizes RTT across
entire batch, dramatically increasing throughput. Cannot use if command requires result
of preceding command (R-C-W dependency).
"""

import redis
from redis.connection import ConnectionPool
import json
import time

POOL = ConnectionPool(host='localhost', port=6379, decode_responses=True)
r = redis.Redis(connection_pool=POOL)


def bulk_set_with_pipeline(items, ttl=3600):
    """
    Bulk set operations using pipeline (single network round trip).
    
    Args:
        items: List of (key, value) tuples
        ttl: TTL in seconds for all keys
    """
    pipe = r.pipeline()
    
    for key, value in items:
        # Buffer commands in pipeline
        pipe.setex(key, ttl, json.dumps(value))
    
    # Execute all commands in single round trip
    results = pipe.execute()
    print(f'Bulk set {len(items)} items in single pipeline')
    return results


def bulk_get_with_pipeline(keys):
    """
    Bulk get operations using pipeline.
    """
    pipe = r.pipeline()
    
    for key in keys:
        pipe.get(key)
    
    # Execute all GET commands in single round trip
    results = pipe.execute()
    return [json.loads(r) if r else None for r in results]


def bulk_hash_operations_with_pipeline(operations):
    """
    Bulk hash operations using pipeline.
    
    Args:
        operations: List of dicts with 'op', 'key', 'field', 'value' keys
    """
    pipe = r.pipeline()
    
    for op in operations:
        if op['op'] == 'hset':
            pipe.hset(op['key'], op['field'], op['value'])
        elif op['op'] == 'hget':
            pipe.hget(op['key'], op['field'])
        elif op['op'] == 'hgetall':
            pipe.hgetall(op['key'])
    
    results = pipe.execute()
    return results


def pipeline_with_transaction(operations):
    """
    Pipeline with transaction (MULTI/EXEC) for atomicity.
    All commands execute atomically or none execute.
    """
    pipe = r.pipeline(transaction=True)
    
    for op in operations:
        if op['type'] == 'set':
            pipe.set(op['key'], op['value'])
        elif op['type'] == 'incr':
            pipe.incr(op['key'])
    
    # Execute as atomic transaction
    results = pipe.execute()
    return results


# Example usage
if __name__ == '__main__':
    # Example 1: Bulk set with pipeline
    print('=== Example 1: Bulk Set with Pipeline ===')
    items = [(f'item:{i}', {'id': i, 'data': f'data_{i}'}) for i in range(100)]
    start = time.time()
    bulk_set_with_pipeline(items, ttl=300)
    elapsed = time.time() - start
    print(f'Time elapsed: {elapsed:.3f}s\n')
    
    # Example 2: Bulk get with pipeline
    print('=== Example 2: Bulk Get with Pipeline ===')
    keys = [f'item:{i}' for i in range(10)]
    results = bulk_get_with_pipeline(keys)
    print(f'Retrieved {len(results)} items\n')
    
    # Example 3: Bulk hash operations
    print('=== Example 3: Bulk Hash Operations ===')
    operations = [
        {'op': 'hset', 'key': 'user:1', 'field': 'name', 'value': 'John'},
        {'op': 'hset', 'key': 'user:1', 'field': 'email', 'value': 'john@example.com'},
        {'op': 'hgetall', 'key': 'user:1'},
    ]
    results = bulk_hash_operations_with_pipeline(operations)
    print(f'Hash operations results: {results}\n')
    
    # Example 4: Pipeline with transaction
    print('=== Example 4: Pipeline with Transaction ===')
    r.set('counter', '0')
    operations = [
        {'type': 'incr', 'key': 'counter'},
        {'type': 'incr', 'key': 'counter'},
        {'type': 'incr', 'key': 'counter'},
    ]
    results = pipeline_with_transaction(operations)
    final_value = r.get('counter')
    print(f'Transaction results: {results}')
    print(f'Final counter value: {final_value}')

