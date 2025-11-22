package com.example.kafka.eventsourcing;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Event representing order creation.
 */
public class OrderCreatedEvent extends OrderEvent {
    private double amount;
    private String customerId;
    
    public OrderCreatedEvent() {
        super();
    }
    
    @JsonCreator
    public OrderCreatedEvent(
            @JsonProperty("orderId") String orderId,
            @JsonProperty("amount") double amount,
            @JsonProperty("customerId") String customerId) {
        super(orderId);
        this.amount = amount;
        this.customerId = customerId;
    }
    
    public double getAmount() {
        return amount;
    }
    
    public void setAmount(double amount) {
        this.amount = amount;
    }
    
    public String getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
}


