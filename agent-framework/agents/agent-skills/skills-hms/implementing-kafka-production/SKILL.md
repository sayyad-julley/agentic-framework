---
name: implementing-kafka-production
description: Implements Apache Kafka production deployments by applying patterns (Reliable Producer acks=all, key-based partitioning, Consumer Group 1:1 ratio, Event Sourcing/CQRS, CDC), following best practices (three-layer durability, Schema Registry backward compatibility, manual offset control, HA/DR), implementing workarounds (hotspotting mitigation, consumer lag internal queue, adaptive clients), and avoiding anti-patterns (message loss acks=0/1, hotspotting, global ordering single partition, schema evolution ignorance, over-provisioning consumers, under-provisioning DR). Use when implementing event-driven architectures, real-time data pipelines, Event Sourcing/CQRS patterns, CDC integration, high-throughput messaging, or stream processing.
version: 1.0.0
dependencies:
  - kafka-python>=2.0.0
  - confluent-kafka>=2.0.0
---

# Implementing Kafka Production

## Overview

Implements Apache Kafka production deployments using distributed event streaming platform patterns. Kafka serves as an immutable commit log providing strong durability guarantees comparable to persistent databases. The platform's partitioned design enables horizontal scalability and parallelism, while replication ensures high availability. This skill provides procedural knowledge for producer reliability, partitioning strategies, schema management, consumer group design, HA/DR configuration, and architectural patterns (Event Sourcing, CQRS) while avoiding critical operational anti-patterns.

## When to Use

Use this skill when:
- Implementing event-driven architectures requiring decoupled, scalable messaging
- Building real-time data pipelines with high throughput requirements
- Implementing Event Sourcing or CQRS patterns with Kafka as Event Store
- Integrating Change Data Capture (CDC) from relational databases
- Deploying high-throughput messaging systems replacing traditional message brokers
- Building stream processing applications with stateful aggregations
- Setting up high availability and disaster recovery for Kafka clusters

**Input format**: Kafka cluster access (broker endpoints), data consistency requirements (strong vs eventual), target throughput, partition count, replication requirements

**Expected output**: Production-ready Kafka configuration following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Kafka cluster access (broker endpoints: host:port)
- Understanding of data consistency requirements (strong vs eventual consistency)
- Network connectivity to Kafka brokers
- Schema Registry access (if using schema management with Avro/Protobuf)
- Topic creation permissions or administrative access
- Understanding of partition count impact on parallelism and ordering guarantees

## Execution Steps

### Step 1: Producer Reliability Pattern

Achieving reliable message delivery requires meticulous producer configuration enforcing durability guarantees.

#### Reliable Producer Configuration

**Pattern**: Three-layer durability guarantee requiring alignment between producer settings, topic configuration, and broker settings.

**Template**:
```java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-broker1:9092,kafka-broker2:9092");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "io.confluent.kafka.serializers.json.KafkaJsonSerializer");

// Durability Configuration (Mandatory for critical data)
props.put(ProducerConfig.ACKS_CONFIG, "all"); // Wait for all ISR
props.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE); // Aggressive retries
props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5); // Enable idempotence

// Performance Configuration
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");
props.put(ProducerConfig.LINGER_MS_CONFIG, 10); // Batch optimization
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 32768); // 32KB batches
```

**Three-Layer Durability**:
1. **Producer**: `acks=all` (or `-1`) ensures leader waits for all In-Sync Replicas (ISR)
2. **Topic**: `replication.factor >= 3` provides redundancy
3. **Broker**: `min.insync.replicas >= 2` enforces minimum ISR requirement

**Best Practice**: Use asynchronous send with callback function to ensure maximum throughput while capturing errors. Configure idempotence (`enable.idempotence=true`) to prevent duplicate messages during retries.

**Anti-Pattern**: ❌ Using `acks=0` or `acks=1` for mission-critical data (direct message loss risk). ❌ Not configuring retries (transient failures cause message loss). ❌ Misalignment between producer, topic, and broker durability settings (breaks end-to-end guarantee).

### Step 2: Partitioning Strategy

Message ordering is strictly guaranteed only within a single partition. Partitioning strategy determines both ordering guarantees and parallelism.

#### Key-Based Partitioning

**Pattern**: Use consistent hashing on message key to route messages to partitions, ensuring same-entity messages always go to same partition.

**Template**:
```java
// Key selection ensures same-entity messages route to same partition
String key = orderId; // Use entity identifier as key
ProducerRecord<String, String> record = new ProducerRecord<>("orders-topic", key, orderData);
producer.send(record);
```

**Best Practice**: Choose keys with sufficient cardinality to ensure uniform distribution. Use composite keys (e.g., `userId:sessionId`) when single key has low cardinality. Monitor partition distribution to detect skew.

**Hotspotting Mitigation**:
```java
// Composite key for better distribution
String compositeKey = userId + ":" + timestamp; // Increases cardinality
// Or: Use hash of low-cardinality key combined with random component
String distributedKey = hash(userId) + ":" + randomComponent;
```

**Anti-Pattern**: ❌ Low cardinality keys (e.g., few key values account for majority of data) causing hotspotting and partition overload. ❌ Demanding global ordering across entire topic (forces single partition, eliminates parallelism). ❌ Using mutable attributes as keys (e.g., user name) instead of immutable identifiers (e.g., user ID).

**Workaround**: When monitoring reveals data skew, modify application logic to generate more uniformly distributed keys (composite keys, hash-based distribution) or dynamically increase partition count and rebalance data load.

### Step 3: Schema Management

The complexity and long lifespan of event streams necessitate rigorous data governance through centralized schema management.

#### Schema Registry Integration

**Pattern**: Centralized Schema Registry manages schema versions and applies compatibility checks using Avro or Protobuf formats.

**Template**:
```java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-broker1:9092");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, KafkaAvroSerializer.class.getName());
props.put("schema.registry.url", "http://schema-registry:8081");
```

**Compatibility Types**:
- **Backward Compatibility** (Standard): Older consumer can read data written by newer producer. Allows adding optional fields.
- **Forward Compatibility**: Newer consumer can read data written by older producer. Allows dropping fields.
- **Full Compatibility** (Safest): Both directions supported. Most restrictive changes.

**Best Practice**: Use backward compatibility as standard. Consumers must be updated before producers deploy schema changes. Use Avro or Protobuf for robust type safety and schema evolution.

**Anti-Pattern**: ❌ Ignoring schema evolution (downstream consumers cannot handle new/updated schemas, causing production failures). ❌ Not using Schema Registry (no version management, no compatibility checks). ❌ Breaking compatibility changes without coordinated deployment.

### Step 4: Consumer Group Design

Consumer parallelism is determined by partition count. Optimal consumer group design balances throughput with resource efficiency.

#### Consumer Count and Partition Ratio

**Pattern**: Maintain consumer count equal to or less than partition count. For maximum parallelism, use 1:1 ratio.

**Template**:
```java
Properties props = new Properties();
props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-broker1:9092");
props.put(ConsumerConfig.GROUP_ID_CONFIG, "my-transaction-processor-group");
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false"); // Manual offset control
props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Collections.singletonList("InputTopicName"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    
    for (ConsumerRecord<String, String> record : records) {
        // Processing logic
    }
    
    // Commit offsets asynchronously only after processing batch succeeds
    consumer.commitAsync();
}
```

**Best Practice**: Manual offset control is essential for guaranteed delivery (exactly-once or at-least-once semantics). Commit offsets only after successful processing to prevent data loss. Use `commitAsync()` for better throughput.

**Anti-Pattern**: ❌ Over-provisioning consumers (more consumers than partitions) creates computational overhead for Kafka during partition assignment and results in idle resources. ❌ Auto-commit enabled for critical data (risks data loss on consumer failure). ❌ Committing offsets before processing completes (data loss on failure).

### Step 5: Consumer Lag Mitigation

Consumer lag (unprocessed messages piling up) is often a symptom of downstream processing bottlenecks, not Kafka configuration issues.

#### Holistic Monitoring

**Pattern**: Monitor both consumer host performance (CPU, memory, network) and offset lag metrics. Lag often indicates insufficient consumer application performance.

**Best Practice**: Track consumer host performance alongside offset lag. Root causes include network issues, resource constraints (CPU/memory), or blocking downstream processing logic (synchronous external API calls).

**Internal Queue Workaround**:
```java
// Kafka consumer quickly polls and commits, transfers to internal queue for slow processing
BlockingQueue<ConsumerRecord<String, String>> internalQueue = new LinkedBlockingQueue<>();

// Consumer thread: Fast poll and commit
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        internalQueue.offer(record); // Transfer to internal queue
    }
    consumer.commitAsync(); // Commit immediately, preventing lag accumulation
}

// Processing thread: Slow processing from internal queue
while (true) {
    ConsumerRecord<String, String> record = internalQueue.take();
    // Slow processing (e.g., synchronous external API call)
    processRecord(record);
}
```

**Best Practice**: Use internal application-specific queue to buffer messages. Kafka consumer quickly polls, commits offset (preventing lag accumulation), and transfers records to internal queue for isolated, slower processing. This avoids bottlenecking other messages waiting in Kafka topic.

**Anti-Pattern**: ❌ Assuming lag is always a Kafka configuration issue (often indicates downstream processing bottlenecks). ❌ Not monitoring consumer host performance (missing root cause). ❌ Blocking Kafka consumer thread with slow operations (prevents offset commits, increases lag).

### Step 6: High Availability (HA)

High Availability focuses on preventing downtime within a single data center by ensuring service remains operational despite component failures.

#### HA Configuration

**Pattern**: Rack awareness, replication factor >=3, ISR monitoring, time synchronization, leader stability.

**Broker Configuration Template**:
```bash
# server.properties
broker.id=1
broker.rack=rack1  # Rack awareness for replica distribution

# Replication
default.replication.factor=3
min.insync.replicas=2

# Leader stability
unclean.leader.election.enable=false  # Prevent out-of-sync replicas from becoming leader
```

**Best Practice**: 
- Use `broker.rack` configuration to distribute partition replicas across different failure domains (separate racks or cloud availability zones)
- Set replication factor to at least 3 for necessary redundancy
- Configure `min.insync.replicas` to enforce minimum ISR requirement
- Ensure accurate time synchronization across all Kafka components (brokers, clients) using NTP
- Monitor ISR shrinkage metric (indicates network problems or insufficient broker resources)
- Use `kafka-preferred-replica-election.sh` after maintenance to rebalance leadership evenly

**Anti-Pattern**: ❌ Insufficient replication factor (<3) reducing fault tolerance. ❌ Not using rack awareness (all replicas in same failure domain). ❌ Ignoring ISR shrinkage (underlying network or resource issues). ❌ Time drift across components (causes out-of-order messages, split-brain scenarios).

### Step 7: Disaster Recovery (DR)

Disaster Recovery focuses on restoring service after large-scale events that take down an entire site or region.

#### MirrorMaker 2 Configuration

**Pattern**: Asynchronous cross-cluster replication using MirrorMaker 2 (MM2) for Active-Passive DR model.

**MM2 Configuration Template**:
```properties
# mm2.properties
clusters = primary, dr
primary.bootstrap.servers = primary-kafka:9092
dr.bootstrap.servers = dr-kafka:9092

# Replication
primary->dr.enabled = true
primary->dr.topics = .*
primary->dr.consumer.group.id = mm2-replication-group
```

**Best Practice**: 
- Use asynchronous replication (synchronous across significant distances is impractical due to latency)
- Active-Passive model: Passive cluster continuously replicates data but handles no live client traffic
- Size DR cluster to handle 100% of maximum anticipated production workload (not just replication stream)
- Plan for RPO (Recovery Point Objective): Maximum tolerable data loss, dictated by replication lag
- Plan for RTO (Recovery Time Objective): Time required to fully restore service, including client failover

**Anti-Pattern**: ❌ Under-provisioning passive cluster (DR cluster must handle full production load during failover, not just replication). ❌ Not accounting for client failover (consumer group offsets must be correctly managed and migrated via MM2). ❌ Synchronous replication across significant distances (impractical latency).

### Step 8: Event Sourcing & CQRS Patterns

Kafka naturally serves as the canonical Event Store for Event Sourcing and the decoupling layer for CQRS architectures.

#### Event Sourcing Pattern

**Pattern**: Application state captured entirely as sequence of domain events. Kafka topics serve as immutable record. Current state calculated from event log.

**Template**:
```java
// Write Segment: Publish events instead of updating database
ProducerRecord<String, String> event = new ProducerRecord<>(
    "order-events", 
    orderId, 
    jsonMapper.writeValueAsString(new OrderCreatedEvent(orderId, amount))
);
producer.send(event);

// Read Segment: Event Handler consumes events, builds materialized view
KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Collections.singletonList("order-events"));

while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        OrderEvent event = jsonMapper.readValue(record.value(), OrderEvent.class);
        // Update read-optimized database (materialized view)
        updateReadDatabase(event);
    }
}
```

**Best Practice**: 
- Event aggregation: Combine related event objects to generate current state
- Materialized views: Compute/summarize event data into separate, read-optimized data store
- Event replay: Replay events from log to regenerate current state (vital for auditing or data model migration)

**Trade-off**: Eventual consistency. Transaction completes when event written to Kafka log, but read query accesses materialized view updated asynchronously. Design client applications to tolerate potential data staleness.

#### CQRS Pattern

**Pattern**: Separation of Write Segment (commands, publishes events) from Read Segment (queries, accesses materialized views). Kafka acts as decoupling layer.

**Best Practice**: 
- Write Segment processes commands and publishes events to Kafka topic (Event Store)
- Event Handler (often Kafka Streams) subscribes to event topic, transforms, writes to Read Database
- Read Segment accesses read-optimized database directly for accelerated query performance
- Supports continuous evolution: Deploy new event handler reading same historical event stream, building new materialized view in separate read store

**Anti-Pattern**: ❌ Not accepting eventual consistency (CQRS/ES requires tolerance for data staleness). ❌ Directly updating read database from write segment (breaks CQRS separation).

### Step 9: Kafka Streams (State Management)

Kafka Streams provides distributed stream processing framework with local, fault-tolerant state stores for materialized views.

#### KStream and KTable

**Pattern**: KStream models infinite, immutable event history. KTable models changelog and current, mutable state.

**Template**:
```java
StreamsBuilder builder = new StreamsBuilder();

// Input stream
KStream<String, String> textLines = builder.stream("TextLinesTopic");

// Transformations: flatten lines into words, group, count
KTable<String, Long> wordCounts = textLines
    .flatMapValues(textLine -> Arrays.asList(textLine.toLowerCase().split("\\W+")))
    .groupBy((_, word) -> word, Grouped.as("word-group"))
    .count(Materialized.as("CountsStore")); // Persistence definition

// Output changelog stream to new topic
wordCounts.toStream().to("WordsWithCountsTopic");
```

**Best Practice**: Use Kafka Streams for implementing stateful Event Handler role in CQRS pattern. Native handling of local, fault-tolerant state stores for materialized views. Supports windowed joins and aggregations for real-time processing.

**Anti-Pattern**: ❌ Not using Materialized views for CQRS read models (missing performance optimization). ❌ Ignoring state store fault tolerance (data loss risk).

## Transformation Rules

1. **Durability**: Always configure three-layer guarantee (producer `acks=all`, topic `replication.factor >= 3`, broker `min.insync.replicas >= 2`). Misalignment breaks end-to-end guarantee.

2. **Partitioning**: Keys must ensure same-entity messages route to same partition. Use entity identifiers (not mutable attributes) as keys. Monitor partition distribution to detect skew.

3. **Ordering**: Message ordering guaranteed only within partition. Global ordering requires single partition (eliminates parallelism). Design partitioning strategy to preserve causal order for related entities.

4. **Schema Evolution**: Use Schema Registry with backward compatibility. Coordinate consumer updates before producer schema changes. Never ignore schema evolution (causes production failures).

5. **Consumer Scaling**: Consumer count must not exceed partition count. For maximum parallelism, use 1:1 ratio. Over-provisioning creates overhead and idle resources.

6. **Offset Management**: Use manual offset control for guaranteed delivery. Commit offsets only after successful processing. Auto-commit risks data loss on consumer failure.

## Anti-Patterns

This section consolidates critical anti-patterns to avoid when implementing Kafka production deployments. Each anti-pattern is categorized by area and includes the risk, why it's problematic, and the correct pattern to use instead.

### Producer Anti-Patterns

#### ❌ Using `acks=0` or `acks=1` for Mission-Critical Data

**Problem**: Direct message loss risk. With `acks=0`, producer doesn't wait for any acknowledgment. With `acks=1`, producer only waits for leader acknowledgment, not replicas. If leader fails before replicas catch up, messages are lost.

**Impact**: Data loss, inability to meet durability requirements, production incidents.

**Correct Pattern**: Use `acks=all` (or `-1`) to ensure leader waits for all In-Sync Replicas (ISR). See Step 1: Producer Reliability Pattern.

#### ❌ Not Configuring Retries

**Problem**: Transient failures (network glitches, broker restarts) cause message loss. Without retries, producer gives up immediately on any failure.

**Impact**: Message loss during transient failures, reduced reliability.

**Correct Pattern**: Configure `retries=Integer.MAX_VALUE` with idempotence enabled. See Step 1: Producer Reliability Pattern.

#### ❌ Misalignment Between Producer, Topic, and Broker Durability Settings

**Problem**: Breaks end-to-end durability guarantee. Example: Producer uses `acks=all`, but topic has `replication.factor=1` or broker has `min.insync.replicas=1`. If single replica fails, data is lost despite producer configuration.

**Impact**: False sense of durability, data loss despite producer settings.

**Correct Pattern**: Align three-layer durability: Producer `acks=all`, Topic `replication.factor >= 3`, Broker `min.insync.replicas >= 2`. See Step 1: Producer Reliability Pattern.

### Partitioning Anti-Patterns

#### ❌ Low Cardinality Keys Causing Hotspotting

**Problem**: Few key values account for majority of data, causing partition overload. Example: Using `country` as key when 80% of messages are from one country. That partition becomes a bottleneck.

**Impact**: Partition saturation, reduced parallelism, performance degradation, inability to scale.

**Correct Pattern**: Use keys with sufficient cardinality. Use composite keys (e.g., `userId:timestamp`) or hash-based distribution for low-cardinality keys. Monitor partition distribution. See Step 2: Partitioning Strategy.

#### ❌ Demanding Global Ordering Across Entire Topic

**Problem**: Forces single partition design, eliminating parallelism. Kafka only guarantees ordering within a partition. Global ordering requires all messages in one partition.

**Impact**: Zero parallelism, throughput bottleneck, inability to scale horizontally.

**Correct Pattern**: Design partitioning strategy to preserve causal order for related entities. Use entity identifiers as keys to ensure same-entity messages route to same partition. Accept partition-local ordering. See Step 2: Partitioning Strategy.

#### ❌ Using Mutable Attributes as Keys

**Problem**: Keys must be immutable. Using mutable attributes (e.g., user name, email) causes messages for same entity to route to different partitions when attribute changes, breaking ordering guarantees.

**Impact**: Lost ordering guarantees, incorrect partition assignment, data inconsistency.

**Correct Pattern**: Use immutable entity identifiers (e.g., user ID, order ID) as keys. See Step 2: Partitioning Strategy.

### Schema Management Anti-Patterns

#### ❌ Ignoring Schema Evolution

**Problem**: Downstream consumers cannot handle new/updated schemas, causing production failures. Schema changes without coordination break consumer deserialization.

**Impact**: Production failures, service outages, data processing errors.

**Correct Pattern**: Use Schema Registry with backward compatibility. Coordinate consumer updates before producer schema changes. Use Avro or Protobuf for robust type safety. See Step 3: Schema Management.

#### ❌ Not Using Schema Registry

**Problem**: No version management, no compatibility checks. Schema changes break consumers without detection. No centralized schema governance.

**Impact**: Production failures, schema drift, inability to track schema versions.

**Correct Pattern**: Integrate Schema Registry for centralized schema management, versioning, and compatibility checks. See Step 3: Schema Management.

#### ❌ Breaking Compatibility Changes Without Coordinated Deployment

**Problem**: Deploying incompatible schema changes without updating consumers first causes immediate production failures.

**Impact**: Service outages, data processing failures, rollback required.

**Correct Pattern**: Use backward compatibility as standard. Update consumers before producers deploy schema changes. Coordinate deployments. See Step 3: Schema Management.

### Consumer Anti-Patterns

#### ❌ Over-Provisioning Consumers

**Problem**: More consumers than partitions creates computational overhead for Kafka during partition assignment and results in idle resources. Extra consumers sit idle, consuming resources.

**Impact**: Resource waste, unnecessary overhead, no performance benefit.

**Correct Pattern**: Maintain consumer count equal to or less than partition count. For maximum parallelism, use 1:1 ratio. See Step 4: Consumer Group Design.

#### ❌ Auto-Commit Enabled for Critical Data

**Problem**: Risks data loss on consumer failure. Auto-commit commits offsets periodically, not after processing. If consumer crashes after commit but before processing, messages are lost.

**Impact**: Data loss, inability to guarantee delivery semantics.

**Correct Pattern**: Use manual offset control (`enable.auto.commit=false`). Commit offsets only after successful processing. See Step 4: Consumer Group Design.

#### ❌ Committing Offsets Before Processing Completes

**Problem**: Data loss on failure. If consumer commits offset then crashes during processing, message is lost (never processed, but offset already committed).

**Impact**: Data loss, incomplete processing.

**Correct Pattern**: Commit offsets only after successful processing completes. Use `commitAsync()` for better throughput. See Step 4: Consumer Group Design.

#### ❌ Assuming Lag is Always a Kafka Configuration Issue

**Problem**: Consumer lag is often a symptom of downstream processing bottlenecks, not Kafka configuration. Root causes include network issues, resource constraints, or blocking operations.

**Impact**: Misdiagnosis, wasted effort on Kafka tuning, unresolved performance issues.

**Correct Pattern**: Monitor consumer host performance (CPU, memory, network) alongside offset lag. Address root causes in consumer application. See Step 5: Consumer Lag Mitigation.

#### ❌ Not Monitoring Consumer Host Performance

**Problem**: Missing root cause of lag. Lag metrics alone don't reveal whether issue is Kafka or consumer application.

**Impact**: Inability to diagnose lag, unresolved performance issues.

**Correct Pattern**: Track consumer host performance alongside offset lag. Monitor CPU, memory, network, and downstream processing time. See Step 5: Consumer Lag Mitigation.

#### ❌ Blocking Kafka Consumer Thread with Slow Operations

**Problem**: Prevents offset commits, increases lag. Synchronous external API calls or slow database queries in consumer thread block polling and committing.

**Impact**: Lag accumulation, reduced throughput, potential message loss.

**Correct Pattern**: Use internal application-specific queue. Kafka consumer quickly polls, commits offset, transfers records to internal queue for isolated slow processing. See Step 5: Consumer Lag Mitigation.

### High Availability Anti-Patterns

#### ❌ Insufficient Replication Factor (<3)

**Problem**: Reduces fault tolerance. With replication factor of 1 or 2, single broker failure can cause data loss or unavailability.

**Impact**: Reduced durability, increased risk of data loss, service unavailability.

**Correct Pattern**: Set replication factor to at least 3 for necessary redundancy. See Step 6: High Availability (HA).

#### ❌ Not Using Rack Awareness

**Problem**: All replicas in same failure domain. If rack or availability zone fails, all replicas are lost.

**Impact**: Single point of failure, data loss risk, reduced fault tolerance.

**Correct Pattern**: Use `broker.rack` configuration to distribute partition replicas across different failure domains (separate racks or cloud availability zones). See Step 6: High Availability (HA).

#### ❌ Ignoring ISR Shrinkage

**Problem**: Underlying network or resource issues. ISR (In-Sync Replicas) shrinkage indicates replicas falling out of sync, often due to network problems or insufficient broker resources.

**Impact**: Reduced durability, potential data loss, degraded performance.

**Correct Pattern**: Monitor ISR shrinkage metric. Investigate and resolve underlying network or resource issues. See Step 6: High Availability (HA).

#### ❌ Time Drift Across Components

**Problem**: Causes out-of-order messages, split-brain scenarios. Kafka relies on timestamps for ordering and coordination. Time drift breaks these guarantees.

**Impact**: Incorrect message ordering, coordination failures, data inconsistency.

**Correct Pattern**: Ensure accurate time synchronization across all Kafka components (brokers, clients) using NTP. See Step 6: High Availability (HA).

### Disaster Recovery Anti-Patterns

#### ❌ Under-Provisioning Passive Cluster

**Problem**: DR cluster must handle full production load during failover, not just replication stream. Under-provisioning causes immediate failure upon activation.

**Impact**: DR cluster cannot handle production load, failover failure, extended downtime.

**Correct Pattern**: Size DR cluster to handle 100% of maximum anticipated production workload. See Step 7: Disaster Recovery (DR).

#### ❌ Not Accounting for Client Failover

**Problem**: Consumer group offsets must be correctly managed and migrated via MirrorMaker 2. Without proper offset management, consumers restart from wrong position.

**Impact**: Duplicate processing, data inconsistency, extended recovery time.

**Correct Pattern**: Plan for consumer group offset migration via MM2. Test failover procedures including client reconfiguration. See Step 7: Disaster Recovery (DR).

#### ❌ Synchronous Replication Across Significant Distances

**Problem**: Impractical latency. Synchronous replication across regions introduces unacceptable latency, making it impractical for real-time systems.

**Impact**: High latency, poor performance, impractical for production.

**Correct Pattern**: Use asynchronous replication (MirrorMaker 2) for Active-Passive DR model. Accept RPO based on replication lag. See Step 7: Disaster Recovery (DR).

### Event Sourcing & CQRS Anti-Patterns

#### ❌ Not Accepting Eventual Consistency

**Problem**: CQRS/ES requires tolerance for data staleness. Transaction completes when event written to Kafka log, but read query accesses materialized view updated asynchronously. Rejecting eventual consistency breaks the pattern.

**Impact**: Pattern failure, incorrect implementation, performance issues.

**Correct Pattern**: Design client applications to tolerate potential data staleness or implement confirmation mechanisms. See Step 8: Event Sourcing & CQRS Patterns.

#### ❌ Directly Updating Read Database from Write Segment

**Problem**: Breaks CQRS separation. Write segment should only publish events. Read database should only be updated by event handlers consuming from Kafka.

**Impact**: Breaks CQRS pattern, tight coupling, reduced scalability.

**Correct Pattern**: Write Segment publishes events to Kafka. Event Handler (Kafka Streams) subscribes to event topic, transforms, writes to Read Database. See Step 8: Event Sourcing & CQRS Patterns.

### Kafka Streams Anti-Patterns

#### ❌ Not Using Materialized Views for CQRS Read Models

**Problem**: Missing performance optimization. Materialized views provide read-optimized data stores for CQRS read segments.

**Impact**: Poor query performance, increased load on event store.

**Correct Pattern**: Use Kafka Streams Materialized views for CQRS read models. See Step 9: Kafka Streams (State Management).

#### ❌ Ignoring State Store Fault Tolerance

**Problem**: Data loss risk. State stores must be fault-tolerant to survive failures.

**Impact**: Data loss, incorrect state, processing errors.

**Correct Pattern**: Use Kafka Streams native fault-tolerant state stores. Configure proper replication and backup. See Step 9: Kafka Streams (State Management).

## Examples

### Example 1: Reliable Producer Configuration

**Context**: Mission-critical data pipeline requiring zero message loss.

```java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka-broker1:9092");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, KafkaAvroSerializer.class.getName());
props.put("schema.registry.url", "http://schema-registry:8081");

// Three-layer durability
props.put(ProducerConfig.ACKS_CONFIG, "all");
props.put(ProducerConfig.RETRIES_CONFIG, Integer.MAX_VALUE);
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

// Performance
props.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "lz4");
props.put(ProducerConfig.LINGER_MS_CONFIG, 10);
props.put(ProducerConfig.BATCH_SIZE_CONFIG, 32768);

KafkaProducer<String, GenericRecord> producer = new KafkaProducer<>(props);

// Asynchronous send with callback
producer.send(new ProducerRecord<>("events", key, value), (metadata, exception) -> {
    if (exception != null) {
        // Error handling
    }
});
```

**Key Points**: Three-layer durability (acks=all, replication factor >=3, min.insync.replicas >=2), idempotence enabled, asynchronous send with error callback for maximum throughput.

### Example 2: Consumer with Lag Mitigation

**Context**: Slow downstream processing (synchronous external API calls) causing consumer lag.

```java
BlockingQueue<ConsumerRecord<String, String>> queue = new LinkedBlockingQueue<>();

// Fast consumer thread
Thread consumerThread = new Thread(() -> {
    KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
    consumer.subscribe(Collections.singletonList("input-topic"));
    
    while (true) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
        for (ConsumerRecord<String, String> record : records) {
            queue.offer(record); // Transfer to internal queue
        }
        consumer.commitAsync(); // Commit immediately
    }
});

// Slow processing thread
Thread processorThread = new Thread(() -> {
    while (true) {
        ConsumerRecord<String, String> record = queue.take();
        // Slow operation (e.g., synchronous external API)
        processWithExternalAPI(record);
    }
});

consumerThread.start();
processorThread.start();
```

**Key Points**: Kafka consumer quickly polls and commits offsets (preventing lag accumulation), transfers records to internal queue for isolated slow processing. Avoids bottlenecking other messages in Kafka topic.

## Error Handling

**Producer Failures**:
- **Detection**: Monitor send callback exceptions, retry exhaustion
- **Resolution**: Implement retry logic with exponential backoff, error callbacks for alerting
- **Prevention**: Configure sufficient retries, idempotence enabled, three-layer durability

**Consumer Lag**:
- **Detection**: Monitor offset lag metrics, consumer host performance (CPU, memory, network)
- **Resolution**: Optimize consumer application performance, allocate resources, implement internal queue workaround for slow processing
- **Prevention**: Holistic monitoring (not just lag metrics), proactive resource allocation, avoid blocking operations in consumer thread

**Schema Evolution**:
- **Detection**: Schema compatibility errors, deserialization failures
- **Resolution**: Coordinate consumer updates before producer changes, use backward compatibility, version management
- **Prevention**: Centralized Schema Registry, compatibility checks, coordinated deployments

**Partition Rebalancing**:
- **Detection**: Consumer group rebalancing events, partition assignment changes
- **Resolution**: Graceful handling of rebalancing, commit offsets before rebalance, implement rebalance listeners
- **Prevention**: Stable consumer group membership, avoid frequent consumer restarts

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in SKILL.md or scripts
- ✅ Use external credential management systems
- ✅ Route sensitive operations through secure channels

**Operational Constraints**:
- Use SASL/SSL for authentication and encryption in production
- Implement proper access controls (ACLs) for topic and consumer group access
- Secure network channels (TLS) for broker communication
- Monitor for unauthorized access attempts
- Use secure credential storage (environment variables, secret management systems)

## Dependencies

This skill requires the following packages (listed in frontmatter):
- `kafka-python>=2.0.0`: Python client for Kafka (alternative to Java client)
- `confluent-kafka>=2.0.0`: Advanced Kafka features including Schema Registry integration

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment. The skill cannot install packages at runtime.

**Java Alternative**: For Java implementations, use `org.apache.kafka:kafka-clients` and `io.confluent:kafka-avro-serializer` for Schema Registry integration.

## Performance Considerations

- **Partition Count**: Determines maximum parallelism. More partitions enable more concurrent consumers but increase overhead.
- **Consumer Lag**: Often indicates downstream processing bottlenecks, not Kafka configuration. Monitor consumer host performance alongside lag metrics.
- **Producer Batching**: Configure `linger.ms` and `batch.size` for throughput optimization. Balance latency vs throughput.
- **Compression**: Use compression (lz4, snappy) for network efficiency, especially for high-volume topics.
- **Single Partition Limitation**: Global ordering requires single partition, eliminating parallelism. Design partitioning strategy carefully.
- **Replication Overhead**: Higher replication factor improves durability but increases network and storage overhead.

## Related Resources

For extensive reference materials, see:
- Apache Kafka official documentation for advanced configuration options
- Confluent Schema Registry documentation for schema management
- Kafka Streams documentation for stateful stream processing

## Notes

- **Partition-Local Ordering**: Message ordering guaranteed only within partition. Architects must carefully choose partitioning strategies to preserve causal order for related entities.
- **Eventual Consistency**: CQRS/ES patterns introduce eventual consistency. System architects must design client applications to explicitly tolerate potential data staleness or implement confirmation mechanisms.
- **Durability as Layered Guarantee**: Durability requires alignment between producer reliability settings (acks=all), topic replication factors, and broker configuration (min.insync.replicas). Failure to align these settings compromises data safety.
- **Consumer Lag as Symptom**: Consumer lag is often a symptom of downstream processing bottlenecks (network issues, resource constraints, blocking operations) rather than a Kafka configuration flaw. Address root causes in consumer application.
- **Hotspotting Cannot Be Resolved by Sharding Alone**: Hot keys saturate single shard's CPU regardless of cluster capacity. Architectural workarounds required (client-side caching, read replica distribution).
- **DR Cluster Sizing**: DR cluster must be sized to handle 100% of maximum anticipated production workload during failover, not just replication stream. Under-provisioning causes immediate failure upon activation.

