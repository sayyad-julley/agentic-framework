#!/bin/bash
# Script to check if Redis is running and accessible

echo "Checking Redis connection..."

if redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis is running and accessible"
    echo ""
    echo "Redis Info:"
    redis-cli info server | head -5
    echo ""
    echo "Memory Info:"
    redis-cli info memory | grep -E "used_memory_human|maxmemory_human|maxmemory_policy"
    echo ""
    echo "Test connection: redis-cli ping"
else
    echo "✗ Redis is not running or not accessible"
    echo ""
    echo "To start Redis:"
    echo "  redis-server"
    echo ""
    echo "Or use the start script:"
    echo "  ./start-redis.sh"
    exit 1
fi

