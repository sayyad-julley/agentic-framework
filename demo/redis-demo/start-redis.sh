#!/bin/bash
# Script to start Redis server with configuration

echo "Starting Redis server..."

# Check if Redis is already running
if redis-cli ping > /dev/null 2>&1; then
    echo "Redis is already running!"
    echo "Test connection: redis-cli ping"
    exit 0
fi

# Check if redis.conf exists
if [ -f "redis.conf" ]; then
    echo "Starting Redis with redis.conf configuration..."
    redis-server redis.conf
else
    echo "Starting Redis with default configuration..."
    echo "Note: For production settings, create redis.conf file"
    redis-server
fi

