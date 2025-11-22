package com.example.kafka.eventsourcing;

import com.example.kafka.producer.ReliableKafkaProducer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Write Segment for Event Sourcing pattern.
 * 
 * Pattern: Event Sourcing
 * - Write Segment processes commands and publishes events to Kafka topic (Event Store)
 * - Application state captured entirely as sequence of domain events
 * - Kafka topics serve as immutable record
 * 
 * Best Practices Applied:
 * - Publish events instead of updating database directly
 * - Use entity identifier (orderId) as key for partitioning
 * - Reliable producer with three-layer durability
 * 
 * Anti-Patterns Avoided:
 * - ❌ Directly updating read database from write segment (breaks CQRS separation)
 */
public class EventSourcingWriteSegment {
    
    private static final Logger logger = LoggerFactory.getLogger(EventSourcingWriteSegment.class);
    
    private final ReliableKafkaProducer<String, String> producer;
    private final ObjectMapper objectMapper;
    private final String eventsTopic;
    
    /**
     * Creates Event Sourcing Write Segment.
     * 
     * @param bootstrapServers Kafka broker endpoints
     * @param eventsTopic Topic name for order events
     */
    public EventSourcingWriteSegment(String bootstrapServers, String eventsTopic) {
        this.producer = new ReliableKafkaProducer<>(bootstrapServers, null, eventsTopic, false);
        this.objectMapper = new ObjectMapper();
        this.eventsTopic = eventsTopic;
        
        logger.info("Initialized Event Sourcing Write Segment for topic: {}", eventsTopic);
    }
    
    /**
     * Publishes OrderCreated event.
     * 
     * @param orderId Order identifier (used as key for partitioning)
     * @param amount Order amount
     * @param customerId Customer identifier
     */
    public void createOrder(String orderId, double amount, String customerId) {
        try {
            OrderCreatedEvent event = new OrderCreatedEvent(orderId, amount, customerId);
            String eventJson = objectMapper.writeValueAsString(event);
            
            // Use orderId as key to ensure same-entity messages route to same partition
            producer.send(orderId, eventJson);
            
            logger.info("Published OrderCreated event: orderId={}, amount={}, customerId={}", 
                orderId, amount, customerId);
        } catch (Exception e) {
            logger.error("Error publishing OrderCreated event: orderId={}", orderId, e);
            throw new RuntimeException("Failed to publish OrderCreated event", e);
        }
    }
    
    /**
     * Publishes OrderPaid event.
     * 
     * @param orderId Order identifier
     * @param paymentId Payment identifier
     * @param paymentMethod Payment method
     */
    public void payOrder(String orderId, String paymentId, String paymentMethod) {
        try {
            OrderPaidEvent event = new OrderPaidEvent(orderId, paymentId, paymentMethod);
            String eventJson = objectMapper.writeValueAsString(event);
            
            producer.send(orderId, eventJson);
            
            logger.info("Published OrderPaid event: orderId={}, paymentId={}, paymentMethod={}", 
                orderId, paymentId, paymentMethod);
        } catch (Exception e) {
            logger.error("Error publishing OrderPaid event: orderId={}", orderId, e);
            throw new RuntimeException("Failed to publish OrderPaid event", e);
        }
    }
    
    /**
     * Publishes OrderShipped event.
     * 
     * @param orderId Order identifier
     * @param trackingNumber Tracking number
     * @param carrier Carrier name
     */
    public void shipOrder(String orderId, String trackingNumber, String carrier) {
        try {
            OrderShippedEvent event = new OrderShippedEvent(orderId, trackingNumber, carrier);
            String eventJson = objectMapper.writeValueAsString(event);
            
            producer.send(orderId, eventJson);
            
            logger.info("Published OrderShipped event: orderId={}, trackingNumber={}, carrier={}", 
                orderId, trackingNumber, carrier);
        } catch (Exception e) {
            logger.error("Error publishing OrderShipped event: orderId={}", orderId, e);
            throw new RuntimeException("Failed to publish OrderShipped event", e);
        }
    }
    
    /**
     * Publishes OrderCancelled event.
     * 
     * @param orderId Order identifier
     * @param reason Cancellation reason
     */
    public void cancelOrder(String orderId, String reason) {
        try {
            OrderCancelledEvent event = new OrderCancelledEvent(orderId, reason);
            String eventJson = objectMapper.writeValueAsString(event);
            
            producer.send(orderId, eventJson);
            
            logger.info("Published OrderCancelled event: orderId={}, reason={}", orderId, reason);
        } catch (Exception e) {
            logger.error("Error publishing OrderCancelled event: orderId={}", orderId, e);
            throw new RuntimeException("Failed to publish OrderCancelled event", e);
        }
    }
    
    /**
     * Closes the producer. Always call this to ensure proper cleanup.
     */
    public void close() {
        producer.close();
        logger.info("Closed Event Sourcing Write Segment");
    }
}


