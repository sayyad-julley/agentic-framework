package com.example.kafka.examples;

import com.example.kafka.producer.ReliableKafkaProducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Example demonstrating reliable Kafka producer usage.
 * 
 * This example shows:
 * - Three-layer durability pattern (acks=all, replication factor >=3, min.insync.replicas >=2)
 * - Key-based partitioning for ordering guarantees
 * - Asynchronous send with callback for maximum throughput
 * - Proper error handling and cleanup
 */
public class ProducerExample {
    
    private static final Logger logger = LoggerFactory.getLogger(ProducerExample.class);
    
    public static void main(String[] args) {
        String bootstrapServers = System.getProperty("bootstrap.servers", "localhost:9092");
        String topic = System.getProperty("topic", "example-topic");
        
        logger.info("Starting Producer Example");
        logger.info("Bootstrap servers: {}", bootstrapServers);
        logger.info("Topic: {}", topic);
        
        // Create reliable producer (no Schema Registry for this example)
        ReliableKafkaProducer<String, String> producer = new ReliableKafkaProducer<>(
            bootstrapServers,
            null,
            topic,
            false
        );
        
        try {
            // Send messages with entity identifier as key
            // This ensures same-entity messages route to same partition (ordering guarantee)
            for (int i = 0; i < 10; i++) {
                String orderId = "order-" + (i % 3); // 3 different orders
                String message = "Message " + i + " for order " + orderId;
                
                producer.send(orderId, message);
                logger.info("Sent message: key={}, value={}", orderId, message);
                
                Thread.sleep(100); // Small delay between sends
            }
            
            // Flush to ensure all messages are sent before closing
            producer.flush();
            logger.info("Flushed all pending messages");
            
        } catch (Exception e) {
            logger.error("Error sending messages", e);
        } finally {
            producer.close();
            logger.info("Producer Example completed");
        }
    }
}


