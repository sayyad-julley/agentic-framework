package com.example.kafka.examples;

import com.example.kafka.consumer.LagMitigationConsumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Example demonstrating lag mitigation using internal queue workaround.
 * 
 * This example shows:
 * - Fast poll and commit (prevents lag accumulation)
 * - Internal queue for slow processing isolation
 * - Separate threads for consumption and processing
 * - Use case: Slow downstream processing (e.g., synchronous external API calls)
 */
public class LagMitigationExample {
    
    private static final Logger logger = LoggerFactory.getLogger(LagMitigationExample.class);
    
    public static void main(String[] args) {
        String bootstrapServers = System.getProperty("bootstrap.servers", "localhost:9092");
        String groupId = System.getProperty("group.id", "lag-mitigation-consumer-group");
        String topic = System.getProperty("topic", "example-topic");
        int queueCapacity = Integer.parseInt(System.getProperty("queue.capacity", "1000"));
        
        logger.info("Starting Lag Mitigation Example");
        logger.info("Bootstrap servers: {}", bootstrapServers);
        logger.info("Group ID: {}", groupId);
        logger.info("Topic: {}", topic);
        logger.info("Queue capacity: {}", queueCapacity);
        
        // Create consumer with lag mitigation
        LagMitigationConsumer<String, String> consumer = new LagMitigationConsumer<>(
            bootstrapServers,
            groupId,
            null,
            topic,
            false,
            LagMitigationExample::slowProcessRecord,
            queueCapacity
        );
        
        consumer.start();
        
        // Monitor queue size
        Thread monitorThread = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(5000);
                    int queueSize = consumer.getQueueSize();
                    logger.info("Current queue size: {}", queueSize);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "monitor-thread");
        monitorThread.setDaemon(true);
        monitorThread.start();
        
        // Run for 60 seconds then stop
        try {
            Thread.sleep(60000);
            logger.info("Stopping consumer...");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.warn("Interrupted", e);
        } finally {
            consumer.stop(10000); // Wait up to 10 seconds for threads to finish
            logger.info("Lag Mitigation Example completed");
        }
    }
    
    /**
     * Simulates slow processing (e.g., synchronous external API call).
     * 
     * @param record Consumer record
     * @return true if processing succeeded
     */
    private static Boolean slowProcessRecord(ConsumerRecord<String, String> record) {
        try {
            logger.info("Slow processing record: key={}, value={}, partition={}, offset={}", 
                record.key(), record.value(), record.partition(), record.offset());
            
            // Simulate slow operation (e.g., synchronous external API call, slow database query)
            Thread.sleep(1000); // 1 second delay
            
            return true; // Processing succeeded
        } catch (Exception e) {
            logger.error("Error in slow processing", e);
            return false; // Processing failed
        }
    }
}


