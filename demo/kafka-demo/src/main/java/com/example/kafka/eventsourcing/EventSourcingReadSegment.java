package com.example.kafka.eventsourcing;

import com.example.kafka.consumer.ReliableKafkaConsumer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Read Segment for Event Sourcing pattern.
 * 
 * Pattern: Event Sourcing & CQRS
 * - Event Handler consumes events, builds materialized view
 * - Read Segment accesses read-optimized database directly for accelerated query performance
 * - Supports continuous evolution: Deploy new event handler reading same historical event stream
 * 
 * Best Practices Applied:
 * - Event aggregation: Combine related event objects to generate current state
 * - Materialized views: Compute/summarize event data into separate, read-optimized data store
 * - Event replay: Replay events from log to regenerate current state
 * 
 * Trade-off: Eventual consistency. Transaction completes when event written to Kafka log,
 * but read query accesses materialized view updated asynchronously.
 * 
 * Anti-Patterns Avoided:
 * - ❌ Not accepting eventual consistency (CQRS/ES requires tolerance for data staleness)
 */
public class EventSourcingReadSegment {
    
    private static final Logger logger = LoggerFactory.getLogger(EventSourcingReadSegment.class);
    
    private final ReliableKafkaConsumer<String, String> consumer;
    private final ObjectMapper objectMapper;
    private final Map<String, OrderState> orderStateStore; // Materialized view (in-memory for demo)
    private final Thread consumerThread;
    private volatile boolean running = false;
    
    /**
     * Materialized view state for an order.
     * In production, this would be stored in a read-optimized database.
     */
    public static class OrderState {
        private String orderId;
        private double amount;
        private String customerId;
        private String status; // CREATED, PAID, SHIPPED, CANCELLED
        private String paymentId;
        private String paymentMethod;
        private String trackingNumber;
        private String carrier;
        private String cancellationReason;
        
        public OrderState(String orderId) {
            this.orderId = orderId;
            this.status = "CREATED";
        }
        
        // Getters and setters
        public String getOrderId() { return orderId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getCustomerId() { return customerId; }
        public void setCustomerId(String customerId) { this.customerId = customerId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPaymentId() { return paymentId; }
        public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
        public String getCarrier() { return carrier; }
        public void setCarrier(String carrier) { this.carrier = carrier; }
        public String getCancellationReason() { return cancellationReason; }
        public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    }
    
    /**
     * Creates Event Sourcing Read Segment.
     * 
     * @param bootstrapServers Kafka broker endpoints
     * @param groupId Consumer group ID
     * @param eventsTopic Topic name for order events
     */
    public EventSourcingReadSegment(String bootstrapServers, String groupId, String eventsTopic) {
        this.objectMapper = new ObjectMapper();
        this.orderStateStore = new ConcurrentHashMap<>();
        
        // Event Handler: Consumes events, builds materialized view
        this.consumer = new ReliableKafkaConsumer<>(
            bootstrapServers,
            groupId,
            null,
            eventsTopic,
            false,
            this::processEvent
        );
        
        this.consumerThread = new Thread(() -> {
            running = true;
            consumer.start();
        }, "event-sourcing-read-segment");
        consumerThread.setDaemon(false);
        
        logger.info("Initialized Event Sourcing Read Segment for topic: {}, group: {}", eventsTopic, groupId);
    }
    
    /**
     * Processes an event and updates materialized view.
     * 
     * @param record Consumer record containing event
     * @return true if processing succeeded
     */
    private Boolean processEvent(ConsumerRecord<String, String> record) {
        try {
            String eventJson = record.value();
            OrderEvent event = objectMapper.readValue(eventJson, OrderEvent.class);
            
            String orderId = event.getOrderId();
            OrderState state = orderStateStore.computeIfAbsent(orderId, OrderState::new);
            
            // Event aggregation: Combine related event objects to generate current state
            if (event instanceof OrderCreatedEvent) {
                OrderCreatedEvent createdEvent = (OrderCreatedEvent) event;
                state.setAmount(createdEvent.getAmount());
                state.setCustomerId(createdEvent.getCustomerId());
                state.setStatus("CREATED");
                logger.debug("Updated state from OrderCreated: orderId={}, amount={}", orderId, createdEvent.getAmount());
                
            } else if (event instanceof OrderPaidEvent) {
                OrderPaidEvent paidEvent = (OrderPaidEvent) event;
                state.setPaymentId(paidEvent.getPaymentId());
                state.setPaymentMethod(paidEvent.getPaymentMethod());
                state.setStatus("PAID");
                logger.debug("Updated state from OrderPaid: orderId={}, paymentId={}", orderId, paidEvent.getPaymentId());
                
            } else if (event instanceof OrderShippedEvent) {
                OrderShippedEvent shippedEvent = (OrderShippedEvent) event;
                state.setTrackingNumber(shippedEvent.getTrackingNumber());
                state.setCarrier(shippedEvent.getCarrier());
                state.setStatus("SHIPPED");
                logger.debug("Updated state from OrderShipped: orderId={}, trackingNumber={}", 
                    orderId, shippedEvent.getTrackingNumber());
                
            } else if (event instanceof OrderCancelledEvent) {
                OrderCancelledEvent cancelledEvent = (OrderCancelledEvent) event;
                state.setCancellationReason(cancelledEvent.getReason());
                state.setStatus("CANCELLED");
                logger.debug("Updated state from OrderCancelled: orderId={}, reason={}", 
                    orderId, cancelledEvent.getReason());
            }
            
            return true;
        } catch (Exception e) {
            logger.error("Error processing event: topic={}, partition={}, offset={}", 
                record.topic(), record.partition(), record.offset(), e);
            return false;
        }
    }
    
    /**
     * Starts consuming events and building materialized view.
     */
    public void start() {
        if (running) {
            logger.warn("Read Segment already running");
            return;
        }
        
        consumerThread.start();
        logger.info("Started Event Sourcing Read Segment");
    }
    
    /**
     * Stops consuming events.
     */
    public void stop() {
        running = false;
        consumer.close();
        logger.info("Stopped Event Sourcing Read Segment");
    }
    
    /**
     * Queries materialized view for order state.
     * 
     * @param orderId Order identifier
     * @return Order state (null if not found)
     * 
     * Note: Eventual consistency - state may not reflect latest event if consumer is lagging
     */
    public OrderState getOrderState(String orderId) {
        return orderStateStore.get(orderId);
    }
    
    /**
     * Gets all order states (for demo purposes).
     * 
     * @return Map of orderId to OrderState
     */
    public Map<String, OrderState> getAllOrderStates() {
        return new HashMap<>(orderStateStore);
    }
}


