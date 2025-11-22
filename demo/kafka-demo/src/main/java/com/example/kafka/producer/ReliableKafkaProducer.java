package com.example.kafka.producer;

import com.example.kafka.config.ProducerConfigFactory;
import org.apache.kafka.clients.producer.Callback;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;
import java.util.concurrent.Future;

/**
 * Production-ready Kafka producer implementing three-layer durability pattern.
 * 
 * Three-Layer Durability Guarantee:
 * 1. Producer: acks=all (waits for all In-Sync Replicas)
 * 2. Topic: replication.factor >= 3 (redundancy)
 * 3. Broker: min.insync.replicas >= 2 (minimum ISR requirement)
 * 
 * Best Practices Applied:
 * - acks=all for mission-critical data
 * - retries=Integer.MAX_VALUE with idempotence enabled
 * - Asynchronous send with callback for maximum throughput
 * - Key-based partitioning for ordering guarantees
 * 
 * Anti-Patterns Avoided:
 * - ❌ Using acks=0 or acks=1 for mission-critical data (direct message loss risk)
 * - ❌ Not configuring retries (transient failures cause message loss)
 * - ❌ Misalignment between producer, topic, and broker durability settings
 */
public class ReliableKafkaProducer<K, V> {
    
    private static final Logger logger = LoggerFactory.getLogger(ReliableKafkaProducer.class);
    
    private final KafkaProducer<K, V> producer;
    private final String topic;
    
    /**
     * Creates a reliable Kafka producer with three-layer durability.
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints
     * @param schemaRegistryUrl Schema Registry URL (null if not using Schema Registry)
     * @param topic Topic name to produce to
     * @param useAvro Whether to use Avro serialization (requires Schema Registry)
     */
    public ReliableKafkaProducer(String bootstrapServers, String schemaRegistryUrl, String topic, boolean useAvro) {
        Properties props;
        if (useAvro && schemaRegistryUrl != null) {
            props = ProducerConfigFactory.createAvroProducerConfig(bootstrapServers, schemaRegistryUrl);
        } else {
            props = ProducerConfigFactory.createStringProducerConfig(bootstrapServers);
        }
        
        this.producer = new KafkaProducer<>(props);
        this.topic = topic;
        
        logger.info("Initialized reliable Kafka producer for topic: {}", topic);
        logger.info("Producer configuration: acks=all, retries=MAX, idempotence=enabled");
    }
    
    /**
     * Sends a message asynchronously with callback for error handling.
     * Uses entity identifier as key to ensure same-entity messages route to same partition.
     * 
     * Best Practice: Asynchronous send with callback ensures maximum throughput while capturing errors.
     * 
     * @param key Message key (use entity identifier for ordering guarantees)
     * @param value Message value
     * @return Future for RecordMetadata (can be used for synchronous send if needed)
     */
    public Future<RecordMetadata> send(K key, V value) {
        ProducerRecord<K, V> record = new ProducerRecord<>(topic, key, value);
        
        // Asynchronous send with callback for error handling
        // Best Practice: Use asynchronous send for maximum throughput
        return producer.send(record, new Callback() {
            @Override
            public void onCompletion(RecordMetadata metadata, Exception exception) {
                if (exception != null) {
                    logger.error("Failed to send message: topic={}, partition={}, key={}",
                        topic, metadata != null ? metadata.partition() : "unknown", key, exception);
                    // Consider implementing retry logic or Dead Letter Queue (DLQ) here
                } else {
                    logger.debug("Successfully sent message: topic={}, partition={}, offset={}, key={}",
                        metadata.topic(), metadata.partition(), metadata.offset(), key);
                }
            }
        });
    }
    
    /**
     * Sends a message synchronously (blocks until completion).
     * Use this when you need to ensure message is sent before proceeding.
     * 
     * Note: Synchronous send reduces throughput. Prefer asynchronous send when possible.
     * 
     * @param key Message key
     * @param value Message value
     * @return RecordMetadata for the sent record
     * @throws Exception if send fails
     */
    public RecordMetadata sendSync(K key, V value) throws Exception {
        ProducerRecord<K, V> record = new ProducerRecord<>(topic, key, value);
        return producer.send(record).get();
    }
    
    /**
     * Flushes all pending messages. Blocks until all messages are sent.
     * Call this before closing the producer to ensure all messages are delivered.
     */
    public void flush() {
        producer.flush();
        logger.debug("Flushed all pending messages");
    }
    
    /**
     * Closes the producer. Always call this to ensure proper cleanup.
     * This will also flush any pending messages.
     */
    public void close() {
        producer.close();
        logger.info("Closed Kafka producer");
    }
}

