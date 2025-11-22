#!/bin/bash

# Kafka Demo Run Script
# This script runs the Kafka demo examples

set -e

BOOTSTRAP_SERVERS=${1:-localhost:9092}
KAFKA_HOME=${KAFKA_HOME:-}

echo "=========================================="
echo "Kafka Demo - Running Examples"
echo "=========================================="
echo "Bootstrap servers: $BOOTSTRAP_SERVERS"
echo ""

# Check if Kafka is accessible
if ! nc -z $(echo $BOOTSTRAP_SERVERS | cut -d: -f1) $(echo $BOOTSTRAP_SERVERS | cut -d: -f2) 2>/dev/null; then
    echo "ERROR: Kafka is not accessible at $BOOTSTRAP_SERVERS"
    echo ""
    echo "Please ensure Kafka is running. You can:"
    echo "1. Start Kafka locally"
    echo "2. Use Docker: docker run -d -p 9092:9092 apache/kafka:latest"
    echo "3. Update the bootstrap servers: ./run-examples.sh <host:port>"
    exit 1
fi

echo "✓ Kafka is accessible"
echo ""

# Build the project
echo "Building project..."
mvn clean compile -q
echo "✓ Build successful"
echo ""

# Example 1: Producer
echo "=========================================="
echo "Example 1: Producer"
echo "=========================================="
mvn exec:java -Dexec.mainClass="com.example.kafka.examples.ProducerExample" \
  -Dbootstrap.servers=$BOOTSTRAP_SERVERS \
  -Dtopic=example-topic \
  -q
echo ""

# Wait a bit
sleep 2

# Example 2: Consumer (runs for 5 seconds)
echo "=========================================="
echo "Example 2: Consumer"
echo "=========================================="
timeout 5 mvn exec:java -Dexec.mainClass="com.example.kafka.examples.ConsumerExample" \
  -Dbootstrap.servers=$BOOTSTRAP_SERVERS \
  -Dgroup.id=example-consumer-group \
  -Dtopic=example-topic \
  -q 2>&1 || true
echo ""

# Example 3: Event Sourcing
echo "=========================================="
echo "Example 3: Event Sourcing & CQRS"
echo "=========================================="
mvn exec:java -Dexec.mainClass="com.example.kafka.examples.EventSourcingExample" \
  -Dbootstrap.servers=$BOOTSTRAP_SERVERS \
  -Devents.topic=order-events \
  -Dgroup.id=order-read-segment-group \
  -q
echo ""

echo "=========================================="
echo "All examples completed!"
echo "=========================================="

