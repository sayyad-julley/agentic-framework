package com.example.kafka.eventsourcing;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Base class for order events in Event Sourcing pattern.
 * 
 * Pattern: Event Sourcing
 * - Application state captured entirely as sequence of domain events
 * - Kafka topics serve as immutable record
 * - Current state calculated from event log
 * 
 * Best Practice: Use sealed classes or type discriminator for type safety
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "eventType")
@JsonSubTypes({
    @JsonSubTypes.Type(value = OrderCreatedEvent.class, name = "OrderCreated"),
    @JsonSubTypes.Type(value = OrderPaidEvent.class, name = "OrderPaid"),
    @JsonSubTypes.Type(value = OrderShippedEvent.class, name = "OrderShipped"),
    @JsonSubTypes.Type(value = OrderCancelledEvent.class, name = "OrderCancelled")
})
public abstract class OrderEvent {
    protected String orderId;
    protected long timestamp;
    
    public OrderEvent() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public OrderEvent(String orderId) {
        this.orderId = orderId;
        this.timestamp = System.currentTimeMillis();
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}


