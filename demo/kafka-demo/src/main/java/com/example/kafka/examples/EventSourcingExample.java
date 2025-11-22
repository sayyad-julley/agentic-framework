package com.example.kafka.examples;

import com.example.kafka.eventsourcing.EventSourcingReadSegment;
import com.example.kafka.eventsourcing.EventSourcingWriteSegment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Example demonstrating Event Sourcing and CQRS patterns with Kafka.
 * 
 * This example shows:
 * - Write Segment: Publishes events to Kafka topic (Event Store)
 * - Read Segment: Consumes events, builds materialized view
 * - Event aggregation: Combine related event objects to generate current state
 * - Eventual consistency: Transaction completes when event written, read query accesses materialized view
 */
public class EventSourcingExample {
    
    private static final Logger logger = LoggerFactory.getLogger(EventSourcingExample.class);
    
    public static void main(String[] args) throws InterruptedException {
        String bootstrapServers = System.getProperty("bootstrap.servers", "localhost:9092");
        String eventsTopic = System.getProperty("events.topic", "order-events");
        String groupId = System.getProperty("group.id", "order-read-segment-group");
        
        logger.info("Starting Event Sourcing Example");
        logger.info("Bootstrap servers: {}", bootstrapServers);
        logger.info("Events topic: {}", eventsTopic);
        logger.info("Group ID: {}", groupId);
        
        // Create Write Segment (publishes events)
        EventSourcingWriteSegment writeSegment = new EventSourcingWriteSegment(bootstrapServers, eventsTopic);
        
        // Create Read Segment (consumes events, builds materialized view)
        EventSourcingReadSegment readSegment = new EventSourcingReadSegment(bootstrapServers, groupId, eventsTopic);
        readSegment.start();
        
        // Wait for consumer to start
        Thread.sleep(2000);
        
        try {
            // Create order
            String orderId = "order-123";
            writeSegment.createOrder(orderId, 99.99, "customer-456");
            logger.info("Created order: {}", orderId);
            Thread.sleep(1000);
            
            // Query materialized view (eventual consistency - may need to wait)
            EventSourcingReadSegment.OrderState state = readSegment.getOrderState(orderId);
            if (state != null) {
                logger.info("Order state after creation: orderId={}, status={}, amount={}", 
                    state.getOrderId(), state.getStatus(), state.getAmount());
            } else {
                logger.warn("Order state not yet available (eventual consistency)");
            }
            
            // Pay order
            writeSegment.payOrder(orderId, "payment-789", "CREDIT_CARD");
            logger.info("Paid order: {}", orderId);
            Thread.sleep(1000);
            
            state = readSegment.getOrderState(orderId);
            if (state != null) {
                logger.info("Order state after payment: orderId={}, status={}, paymentId={}", 
                    state.getOrderId(), state.getStatus(), state.getPaymentId());
            }
            
            // Ship order
            writeSegment.shipOrder(orderId, "TRACK-12345", "UPS");
            logger.info("Shipped order: {}", orderId);
            Thread.sleep(1000);
            
            state = readSegment.getOrderState(orderId);
            if (state != null) {
                logger.info("Order state after shipment: orderId={}, status={}, trackingNumber={}", 
                    state.getOrderId(), state.getStatus(), state.getTrackingNumber());
            }
            
            // Flush producer to ensure all events are sent
            writeSegment.close();
            
            // Wait a bit more for consumer to process
            Thread.sleep(2000);
            
            // Final state
            state = readSegment.getOrderState(orderId);
            if (state != null) {
                logger.info("Final order state: orderId={}, status={}, amount={}, customerId={}, trackingNumber={}", 
                    state.getOrderId(), state.getStatus(), state.getAmount(), state.getCustomerId(), state.getTrackingNumber());
            }
            
        } finally {
            readSegment.stop();
            logger.info("Event Sourcing Example completed");
        }
    }
}


