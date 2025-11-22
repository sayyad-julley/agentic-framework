package com.example.kafka.eventsourcing;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Event representing order cancellation.
 */
public class OrderCancelledEvent extends OrderEvent {
    private String reason;
    
    public OrderCancelledEvent() {
        super();
    }
    
    @JsonCreator
    public OrderCancelledEvent(
            @JsonProperty("orderId") String orderId,
            @JsonProperty("reason") String reason) {
        super(orderId);
        this.reason = reason;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}


