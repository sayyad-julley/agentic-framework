package com.example.kafka.eventsourcing;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Event representing order payment.
 */
public class OrderPaidEvent extends OrderEvent {
    private String paymentId;
    private String paymentMethod;
    
    public OrderPaidEvent() {
        super();
    }
    
    @JsonCreator
    public OrderPaidEvent(
            @JsonProperty("orderId") String orderId,
            @JsonProperty("paymentId") String paymentId,
            @JsonProperty("paymentMethod") String paymentMethod) {
        super(orderId);
        this.paymentId = paymentId;
        this.paymentMethod = paymentMethod;
    }
    
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}


