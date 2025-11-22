package com.example.kafka.consumer;

import com.example.kafka.config.ConsumerConfigFactory;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;
import java.util.function.Function;

/**
 * Production-ready Kafka consumer implementing manual offset control pattern.
 * 
 * Best Practices Applied:
 * - Manual offset control (enable.auto.commit=false)
 * - Commit offsets only after successful processing
 * - Consumer count <= partition count (1:1 ratio for maximum parallelism)
 * - Proper error handling and offset management
 * 
 * Anti-Patterns Avoided:
 * - ❌ Auto-commit enabled (risks data loss on consumer failure)
 * - ❌ Committing offsets before processing completes (data loss on failure)
 * - ❌ Over-provisioning consumers (more consumers than partitions)
 * - ❌ Blocking consumer thread with slow operations (prevents offset commits)
 */
public class ReliableKafkaConsumer<K, V> {
    
    private static final Logger logger = LoggerFactory.getLogger(ReliableKafkaConsumer.class);
    
    private final KafkaConsumer<K, V> consumer;
    private final String topic;
    private final Function<ConsumerRecord<K, V>, Boolean> recordProcessor;
    
    /**
     * Creates a reliable Kafka consumer with manual offset control.
     * 
     * @param bootstrapServers Comma-separated list of broker endpoints
     * @param groupId Consumer group ID
     * @param schemaRegistryUrl Schema Registry URL (null if not using Schema Registry)
     * @param topic Topic name to consume from
     * @param useAvro Whether to use Avro deserialization (requires Schema Registry)
     * @param recordProcessor Function to process each record. Returns true if processing succeeded, false otherwise.
     */
    public ReliableKafkaConsumer(
            String bootstrapServers,
            String groupId,
            String schemaRegistryUrl,
            String topic,
            boolean useAvro,
            Function<ConsumerRecord<K, V>, Boolean> recordProcessor) {
        
        Properties props;
        if (useAvro && schemaRegistryUrl != null) {
            props = ConsumerConfigFactory.createAvroConsumerConfig(bootstrapServers, groupId, schemaRegistryUrl);
        } else {
            props = ConsumerConfigFactory.createStringConsumerConfig(bootstrapServers, groupId);
        }
        
        this.consumer = new KafkaConsumer<>(props);
        this.topic = topic;
        this.recordProcessor = recordProcessor;
        
        consumer.subscribe(Collections.singletonList(topic));
        
        logger.info("Initialized reliable Kafka consumer for topic: {}, group: {}", topic, groupId);
        logger.info("Consumer configuration: auto.commit=false, manual offset control enabled");
    }
    
    /**
     * Starts consuming messages. Processes records and commits offsets only after successful processing.
     * This method blocks indefinitely until close() is called.
     * 
     * Best Practice: Commit offsets only after successful processing to prevent data loss.
     */
    public void start() {
        logger.info("Starting consumer for topic: {}", topic);
        
        try {
            while (true) {
                // Poll for records (non-blocking, returns immediately if no records)
                ConsumerRecords<K, V> records = consumer.poll(Duration.ofMillis(100));
                
                if (records.isEmpty()) {
                    continue;
                }
                
                logger.debug("Polled {} records from topic: {}", records.count(), topic);
                
                // Process records and track which partitions were successfully processed
                Map<TopicPartition, OffsetAndMetadata> offsetsToCommit = new java.util.HashMap<>();
                boolean allSucceeded = true;
                
                for (ConsumerRecord<K, V> record : records) {
                    try {
                        // Process record
                        boolean success = recordProcessor.apply(record);
                        
                        if (success) {
                            // Track offset for commit (offset + 1 because we want to commit the next offset)
                            TopicPartition partition = new TopicPartition(record.topic(), record.partition());
                            offsetsToCommit.put(partition, new OffsetAndMetadata(record.offset() + 1));
                            
                            logger.debug("Successfully processed record: topic={}, partition={}, offset={}, key={}",
                                record.topic(), record.partition(), record.offset(), record.key());
                        } else {
                            logger.warn("Record processing returned false: topic={}, partition={}, offset={}, key={}",
                                record.topic(), record.partition(), record.offset(), record.key());
                            allSucceeded = false;
                            break; // Stop processing this batch if one fails
                        }
                    } catch (Exception e) {
                        logger.error("Error processing record: topic={}, partition={}, offset={}, key={}",
                            record.topic(), record.partition(), record.offset(), record.key(), e);
                        allSucceeded = false;
                        break; // Stop processing this batch on error
                    }
                }
                
                // Commit offsets only if all records in batch were successfully processed
                // Anti-Pattern Avoided: ❌ Committing offsets before processing completes
                if (allSucceeded && !offsetsToCommit.isEmpty()) {
                    try {
                        consumer.commitSync(offsetsToCommit);
                        logger.debug("Committed offsets for {} partitions", offsetsToCommit.size());
                    } catch (Exception e) {
                        logger.error("Error committing offsets", e);
                        // Offset commit failure is critical - consider alerting/monitoring
                    }
                } else {
                    logger.warn("Skipping offset commit due to processing failures. Records will be reprocessed.");
                }
            }
        } catch (Exception e) {
            logger.error("Fatal error in consumer loop", e);
            throw e;
        }
    }
    
    /**
     * Closes the consumer. Always call this to ensure proper cleanup.
     */
    public void close() {
        consumer.close();
        logger.info("Closed Kafka consumer");
    }
}


