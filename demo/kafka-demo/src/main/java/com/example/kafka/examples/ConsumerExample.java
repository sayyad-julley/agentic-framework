package com.example.kafka.examples;

import com.example.kafka.consumer.ReliableKafkaConsumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Example demonstrating reliable Kafka consumer usage.
 * 
 * This example shows:
 * - Manual offset control (enable.auto.commit=false)
 * - Commit offsets only after successful processing
 * - Proper error handling
 * - Consumer count <= partition count (1:1 ratio for maximum parallelism)
 */
public class ConsumerExample {
    
    private static final Logger logger = LoggerFactory.getLogger(ConsumerExample.class);
    
    public static void main(String[] args) {
        String bootstrapServers = System.getProperty("bootstrap.servers", "localhost:9092");
        String groupId = System.getProperty("group.id", "example-consumer-group");
        String topic = System.getProperty("topic", "example-topic");
        
        logger.info("Starting Consumer Example");
        logger.info("Bootstrap servers: {}", bootstrapServers);
        logger.info("Group ID: {}", groupId);
        logger.info("Topic: {}", topic);
        
        // Create reliable consumer with manual offset control
        ReliableKafkaConsumer<String, String> consumer = new ReliableKafkaConsumer<>(
            bootstrapServers,
            groupId,
            null,
            topic,
            false,
            ConsumerExample::processRecord
        );
        
        // Start consuming in a separate thread
        Thread consumerThread = new Thread(() -> {
            try {
                consumer.start();
            } catch (Exception e) {
                logger.error("Error in consumer", e);
            }
        }, "consumer-thread");
        
        consumerThread.start();
        
        // Run for 30 seconds then stop
        try {
            Thread.sleep(30000);
            logger.info("Stopping consumer...");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted", e);
        } finally {
            consumer.close();
            logger.info("Consumer Example completed");
        }
    }
    
    /**
     * Processes a consumer record.
     * 
     * @param record Consumer record
     * @return true if processing succeeded, false otherwise
     */
    private static Boolean processRecord(ConsumerRecord<String, String> record) {
        try {
            logger.info("Processing record: key={}, value={}, partition={}, offset={}", 
                record.key(), record.value(), record.partition(), record.offset());
            
            // Simulate processing (e.g., database update, external API call)
            Thread.sleep(10);
            
            return true; // Processing succeeded
        } catch (Exception e) {
            logger.error("Error processing record", e);
            return false; // Processing failed
        }
    }
}


