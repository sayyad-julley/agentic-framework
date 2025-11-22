#!/bin/bash

# Docker Status Checker for Kafka Demo

echo "=========================================="
echo "Docker Status Check"
echo "=========================================="

# Check if Docker is running
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running"
    echo ""
    echo "You can now start Kafka:"
    echo "  docker-compose up -d"
    exit 0
else
    echo "❌ Docker Desktop is not running or is paused"
    echo ""
    echo "To fix this:"
    echo "1. Open Docker Desktop application"
    echo "2. Click the 'Resume' or 'Start' button"
    echo "3. Wait for Docker to fully start (whale icon should be active)"
    echo "4. Then run: docker-compose up -d"
    echo ""
    echo "Attempting to open Docker Desktop..."
    open -a Docker 2>/dev/null || echo "Could not open Docker Desktop automatically"
    echo ""
    echo "Please unpause Docker Desktop manually, then run this script again."
    exit 1
fi

