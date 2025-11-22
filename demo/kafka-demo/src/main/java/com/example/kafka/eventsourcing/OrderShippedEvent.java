package com.example.kafka.eventsourcing;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Event representing order shipment.
 */
public class OrderShippedEvent extends OrderEvent {
    private String trackingNumber;
    private String carrier;
    
    public OrderShippedEvent() {
        super();
    }
    
    @JsonCreator
    public OrderShippedEvent(
            @JsonProperty("orderId") String orderId,
            @JsonProperty("trackingNumber") String trackingNumber,
            @JsonProperty("carrier") String carrier) {
        super(orderId);
        this.trackingNumber = trackingNumber;
        this.carrier = carrier;
    }
    
    public String getTrackingNumber() {
        return trackingNumber;
    }
    
    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }
    
    public String getCarrier() {
        return carrier;
    }
    
    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }
}


