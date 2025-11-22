# Kafka Demo Quick Start Guide

## Prerequisites

1. **Java 21+** - Already installed ✓
2. **Maven 3.6+** - Already installed ✓
3. **Docker Desktop** - Needs to be running

## Step 1: Start Kafka with Docker

**IMPORTANT**: Make sure Docker Desktop is running (unpaused).

```bash
cd kafka-demo
docker-compose up -d
```

Wait about 30 seconds for Kafka to fully start, then verify:

```bash
docker ps
# You should see zookeeper and kafka containers running
```

## Step 2: Create Topics

```bash
# Create example-topic
docker exec kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic example-topic \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists

# Create order-events topic
docker exec kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic order-events \
  --partitions 3 \
  --replication-factor 1 \
  --if-not-exists
```

## Step 3: Build the Project

```bash
mvn clean compile
```

## Step 4: Run Examples

### Example 1: Producer

```bash
mvn exec:java -Dexec.mainClass="com.example.kafka.examples.ProducerExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Dtopic=example-topic
```

### Example 2: Consumer

In one terminal:
```bash
mvn exec:java -Dexec.mainClass="com.example.kafka.examples.ConsumerExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Dgroup.id=example-consumer-group \
  -Dtopic=example-topic
```

In another terminal, run the producer to send messages:
```bash
mvn exec:java -Dexec.mainClass="com.example.kafka.examples.ProducerExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Dtopic=example-topic
```

### Example 3: Event Sourcing & CQRS

```bash
mvn exec:java -Dexec.mainClass="com.example.kafka.examples.EventSourcingExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Devents.topic=order-events \
  -Dgroup.id=order-read-segment-group
```

### Example 4: Lag Mitigation

```bash
mvn exec:java -Dexec.mainClass="com.example.kafka.examples.LagMitigationExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Dgroup.id=lag-mitigation-consumer-group \
  -Dtopic=example-topic \
  -Dqueue.capacity=1000
```

## Using the Run Script

Alternatively, use the provided script:

```bash
./run-examples.sh localhost:9092
```

## Stop Kafka

When done:

```bash
docker-compose down
```

## Troubleshooting

### Docker Desktop is Paused
- Open Docker Desktop
- Click the "Resume" button in the Docker menu
- Wait for Docker to start

### Kafka Connection Refused
- Ensure Docker containers are running: `docker ps`
- Check Kafka logs: `docker logs kafka`
- Wait a bit longer for Kafka to fully start (30-60 seconds)

### Topic Already Exists
- This is fine, the `--if-not-exists` flag prevents errors
- You can list topics: `docker exec kafka kafka-topics --list --bootstrap-server localhost:9092`

## What's Implemented

All examples demonstrate **correct patterns only** (no anti-patterns):

✅ **Producer Reliability**: Three-layer durability (acks=all, replication factor >=3, min.insync.replicas >=2)
✅ **Consumer Design**: Manual offset control, commit after successful processing
✅ **Lag Mitigation**: Internal queue workaround for slow processing
✅ **Event Sourcing & CQRS**: Write/Read segment separation
✅ **Kafka Streams**: Stateful processing with fault-tolerant state stores

