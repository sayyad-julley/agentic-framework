# Kafka Production Implementation

Production-ready Apache Kafka implementation following best practices, patterns, and anti-patterns from the `implementing-kafka-production` skill document.

## Overview

This project demonstrates production-ready Kafka implementations including:

- **Reliable Producer**: Three-layer durability pattern (acks=all, replication factor >=3, min.insync.replicas >=2)
- **Reliable Consumer**: Manual offset control, commit only after successful processing
- **Lag Mitigation**: Internal queue workaround for slow downstream processing
- **Event Sourcing & CQRS**: Write/Read segment separation with Kafka as Event Store
- **Kafka Streams**: Stateful stream processing with fault-tolerant state stores

## Patterns Implemented

### 1. Producer Reliability Pattern

**Three-Layer Durability Guarantee:**
- **Producer**: `acks=all` (waits for all In-Sync Replicas)
- **Topic**: `replication.factor >= 3` (redundancy)
- **Broker**: `min.insync.replicas >= 2` (minimum ISR requirement)

**Key Features:**
- Idempotence enabled (`enable.idempotence=true`)
- Aggressive retries (`retries=Integer.MAX_VALUE`)
- Asynchronous send with callback for maximum throughput
- Key-based partitioning for ordering guarantees

**Anti-Patterns Avoided:**
- ❌ Using `acks=0` or `acks=1` for mission-critical data
- ❌ Not configuring retries
- ❌ Misalignment between producer, topic, and broker durability settings

### 2. Consumer Group Design

**Best Practices:**
- Manual offset control (`enable.auto.commit=false`)
- Commit offsets only after successful processing
- Consumer count <= partition count (1:1 ratio for maximum parallelism)

**Anti-Patterns Avoided:**
- ❌ Over-provisioning consumers (more consumers than partitions)
- ❌ Auto-commit enabled for critical data
- ❌ Committing offsets before processing completes

### 3. Consumer Lag Mitigation

**Internal Queue Workaround:**
- Kafka consumer quickly polls and commits offsets (prevents lag accumulation)
- Transfers records to internal queue for isolated, slower processing
- Separate threads for consumption and processing

**Use Case:** Slow downstream processing (e.g., synchronous external API calls, slow database queries)

**Anti-Patterns Avoided:**
- ❌ Blocking Kafka consumer thread with slow operations
- ❌ Assuming lag is always a Kafka configuration issue

### 4. Event Sourcing & CQRS

**Pattern:**
- **Write Segment**: Publishes events to Kafka topic (Event Store)
- **Read Segment**: Consumes events, builds materialized view
- **Event Handler**: Transforms events, writes to read-optimized database

**Best Practices:**
- Event aggregation: Combine related event objects to generate current state
- Materialized views: Compute/summarize event data into separate, read-optimized data store
- Event replay: Replay events from log to regenerate current state

**Trade-off:** Eventual consistency. Transaction completes when event written to Kafka log, but read query accesses materialized view updated asynchronously.

**Anti-Patterns Avoided:**
- ❌ Not accepting eventual consistency
- ❌ Directly updating read database from write segment

### 5. Kafka Streams (State Management)

**Pattern:**
- KStream models infinite, immutable event history
- KTable models changelog and current, mutable state
- Local, fault-tolerant state stores for materialized views

**Best Practices:**
- Use Kafka Streams for implementing stateful Event Handler role in CQRS pattern
- Native handling of local, fault-tolerant state stores
- Supports windowed joins and aggregations for real-time processing

**Anti-Patterns Avoided:**
- ❌ Not using Materialized views for CQRS read models
- ❌ Ignoring state store fault tolerance

## Project Structure

```
kafka-demo/
├── src/main/java/com/example/kafka/
│   ├── config/
│   │   ├── ProducerConfigFactory.java    # Producer configuration factory
│   │   └── ConsumerConfigFactory.java    # Consumer configuration factory
│   ├── producer/
│   │   └── ReliableKafkaProducer.java    # Reliable producer implementation
│   ├── consumer/
│   │   ├── ReliableKafkaConsumer.java    # Reliable consumer with manual offset control
│   │   └── LagMitigationConsumer.java     # Consumer with lag mitigation
│   ├── eventsourcing/
│   │   ├── OrderEvent.java               # Base event class
│   │   ├── OrderCreatedEvent.java        # Order created event
│   │   ├── OrderPaidEvent.java           # Order paid event
│   │   ├── OrderShippedEvent.java        # Order shipped event
│   │   ├── OrderCancelledEvent.java      # Order cancelled event
│   │   ├── EventSourcingWriteSegment.java # Write segment (publishes events)
│   │   └── EventSourcingReadSegment.java # Read segment (builds materialized view)
│   ├── streams/
│   │   └── WordCountStreamsApp.java      # Kafka Streams word count example
│   └── examples/
│       ├── ProducerExample.java          # Producer usage example
│       ├── ConsumerExample.java          # Consumer usage example
│       ├── LagMitigationExample.java     # Lag mitigation example
│       └── EventSourcingExample.java     # Event Sourcing/CQRS example
└── pom.xml                                # Maven dependencies
```

## Prerequisites

- Java 21 or higher
- Maven 3.6 or higher
- Kafka cluster (local or remote)
- (Optional) Schema Registry for Avro serialization

## Dependencies

- `org.apache.kafka:kafka-clients:3.6.0` - Apache Kafka client library
- `io.confluent:kafka-avro-serializer:7.5.0` - Confluent Avro serializer (Schema Registry)
- `io.confluent:kafka-json-serializer:7.5.0` - Confluent JSON serializer
- `com.fasterxml.jackson.core:jackson-databind:2.15.2` - JSON processing
- `org.slf4j:slf4j-api:2.0.9` - Logging API
- `ch.qos.logback:logback-classic:1.4.11` - Logging implementation

## Configuration

### Environment Variables

Set the following environment variables or system properties:

- `bootstrap.servers`: Kafka broker endpoints (default: `localhost:9092`)
- `schema.registry.url`: Schema Registry URL (optional, for Avro serialization)
- `topic`: Topic name (default: `example-topic`)
- `group.id`: Consumer group ID (default: `example-consumer-group`)

### Topic Configuration

Before running examples, create topics with proper configuration:

```bash
# Create topic with replication factor >= 3 and min.insync.replicas >= 2
kafka-topics.sh --bootstrap-server localhost:9092 \
  --create \
  --topic example-topic \
  --partitions 3 \
  --replication-factor 3 \
  --config min.insync.replicas=2
```

**Note:** For local development with single broker, use `--replication-factor 1` and `--config min.insync.replicas=1` (not production-ready).

## Usage Examples

### 1. Producer Example

Demonstrates reliable producer with three-layer durability:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.kafka.examples.ProducerExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Dtopic=example-topic
```

### 2. Consumer Example

Demonstrates reliable consumer with manual offset control:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.kafka.examples.ConsumerExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Dgroup.id=example-consumer-group \
  -Dtopic=example-topic
```

### 3. Lag Mitigation Example

Demonstrates consumer with internal queue workaround for slow processing:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.kafka.examples.LagMitigationExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Dgroup.id=lag-mitigation-consumer-group \
  -Dtopic=example-topic \
  -Dqueue.capacity=1000
```

### 4. Event Sourcing Example

Demonstrates Event Sourcing and CQRS patterns:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.kafka.examples.EventSourcingExample" \
  -Dbootstrap.servers=localhost:9092 \
  -Devents.topic=order-events \
  -Dgroup.id=order-read-segment-group
```

### 5. Kafka Streams Example

Demonstrates stateful stream processing:

```bash
mvn compile exec:java -Dexec.mainClass="com.example.kafka.streams.WordCountStreamsApp" \
  -Dbootstrap.servers=localhost:9092 \
  -Dapplication.id=word-count-app \
  -Dinput.topic=text-lines \
  -Doutput.topic=word-counts
```

## Best Practices Checklist

### Producer Configuration

- ✅ `acks=all` (or `-1`) for mission-critical data
- ✅ `retries=Integer.MAX_VALUE` with idempotence enabled
- ✅ `enable.idempotence=true` to prevent duplicates
- ✅ `max.in.flight.requests.per.connection=5` (required for idempotence)
- ✅ Asynchronous send with callback for error handling
- ✅ Key-based partitioning using entity identifiers

### Consumer Configuration

- ✅ `enable.auto.commit=false` for manual offset control
- ✅ Commit offsets only after successful processing
- ✅ Consumer count <= partition count (1:1 ratio for maximum parallelism)
- ✅ Monitor consumer host performance alongside offset lag
- ✅ Use internal queue for slow downstream processing

### Topic Configuration

- ✅ `replication.factor >= 3` for redundancy
- ✅ `min.insync.replicas >= 2` for durability
- ✅ Partition count based on parallelism requirements
- ✅ Key-based partitioning strategy

### Schema Management

- ✅ Use Schema Registry for centralized schema management
- ✅ Backward compatibility as standard
- ✅ Coordinate consumer updates before producer schema changes
- ✅ Use Avro or Protobuf for robust type safety

### High Availability

- ✅ Rack awareness (`broker.rack` configuration)
- ✅ Replication factor >= 3
- ✅ `min.insync.replicas >= 2`
- ✅ Time synchronization (NTP) across all components
- ✅ Monitor ISR shrinkage

### Disaster Recovery

- ✅ Size DR cluster to handle 100% of production workload
- ✅ Plan for consumer group offset migration via MirrorMaker 2
- ✅ Use asynchronous replication (MirrorMaker 2)
- ✅ Test failover procedures

## Anti-Patterns to Avoid

See the comprehensive [Anti-Patterns section](../agent-framework/agents/agent-skills/skills-hms/implementing-kafka-production/SKILL.md#anti-patterns) in the skill document for detailed anti-patterns organized by category:

- **Producer Anti-Patterns**: Using acks=0/1, not configuring retries, misalignment
- **Partitioning Anti-Patterns**: Low cardinality keys, global ordering, mutable keys
- **Schema Management Anti-Patterns**: Ignoring schema evolution, not using Schema Registry
- **Consumer Anti-Patterns**: Over-provisioning, auto-commit, blocking operations
- **HA/DR Anti-Patterns**: Insufficient replication, no rack awareness, under-provisioning DR
- **Event Sourcing/CQRS Anti-Patterns**: Not accepting eventual consistency, breaking CQRS separation

## Monitoring

### Key Metrics to Monitor

- **Producer**: Send callback exceptions, retry exhaustion, throughput
- **Consumer**: Offset lag, consumer host performance (CPU, memory, network), processing time
- **Broker**: ISR shrinkage, replication lag, partition distribution
- **Schema Registry**: Compatibility errors, deserialization failures

### Consumer Lag Diagnosis

Consumer lag is often a symptom of downstream processing bottlenecks, not Kafka configuration:

1. Monitor consumer host performance (CPU, memory, network)
2. Check for blocking operations in consumer thread
3. Implement internal queue workaround for slow processing
4. Optimize consumer application performance

## Error Handling

### Producer Failures

- **Detection**: Monitor send callback exceptions, retry exhaustion
- **Resolution**: Implement retry logic with exponential backoff, error callbacks for alerting
- **Prevention**: Configure sufficient retries, idempotence enabled, three-layer durability

### Consumer Lag

- **Detection**: Monitor offset lag metrics, consumer host performance
- **Resolution**: Optimize consumer application performance, allocate resources, implement internal queue workaround
- **Prevention**: Holistic monitoring, proactive resource allocation, avoid blocking operations

### Schema Evolution

- **Detection**: Schema compatibility errors, deserialization failures
- **Resolution**: Coordinate consumer updates before producer changes, use backward compatibility
- **Prevention**: Centralized Schema Registry, compatibility checks, coordinated deployments

## Security

**CRITICAL**: Never hardcode sensitive information:

- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in configuration files
- ✅ Use external credential management systems
- ✅ Route sensitive operations through secure channels

**Operational Constraints:**

- Use SASL/SSL for authentication and encryption in production
- Implement proper access controls (ACLs) for topic and consumer group access
- Secure network channels (TLS) for broker communication
- Monitor for unauthorized access attempts
- Use secure credential storage (environment variables, secret management systems)

## Performance Considerations

- **Partition Count**: Determines maximum parallelism. More partitions enable more concurrent consumers but increase overhead.
- **Consumer Lag**: Often indicates downstream processing bottlenecks, not Kafka configuration. Monitor consumer host performance alongside lag metrics.
- **Producer Batching**: Configure `linger.ms` and `batch.size` for throughput optimization. Balance latency vs throughput.
- **Compression**: Use compression (lz4, snappy) for network efficiency, especially for high-volume topics.
- **Single Partition Limitation**: Global ordering requires single partition, eliminating parallelism. Design partitioning strategy carefully.
- **Replication Overhead**: Higher replication factor improves durability but increases network and storage overhead.

## Related Resources

- [Apache Kafka Official Documentation](https://kafka.apache.org/documentation/)
- [Confluent Schema Registry Documentation](https://docs.confluent.io/platform/current/schema-registry/index.html)
- [Kafka Streams Documentation](https://kafka.apache.org/documentation/streams/)
- [Implementing Kafka Production Skill Document](../agent-framework/agents/agent-skills/skills-hms/implementing-kafka-production/SKILL.md)

## Notes

- **Partition-Local Ordering**: Message ordering guaranteed only within partition. Architects must carefully choose partitioning strategies to preserve causal order for related entities.
- **Eventual Consistency**: CQRS/ES patterns introduce eventual consistency. System architects must design client applications to explicitly tolerate potential data staleness or implement confirmation mechanisms.
- **Durability as Layered Guarantee**: Durability requires alignment between producer reliability settings (acks=all), topic replication factors, and broker configuration (min.insync.replicas). Failure to align these settings compromises data safety.
- **Consumer Lag as Symptom**: Consumer lag is often a symptom of downstream processing bottlenecks (network issues, resource constraints, blocking operations) rather than a Kafka configuration flaw. Address root causes in consumer application.
- **Hotspotting Cannot Be Resolved by Sharding Alone**: Hot keys saturate single shard's CPU regardless of cluster capacity. Architectural workarounds required (client-side caching, read replica distribution).
- **DR Cluster Sizing**: DR cluster must be sized to handle 100% of maximum anticipated production workload during failover, not just replication stream. Under-provisioning causes immediate failure upon activation.


