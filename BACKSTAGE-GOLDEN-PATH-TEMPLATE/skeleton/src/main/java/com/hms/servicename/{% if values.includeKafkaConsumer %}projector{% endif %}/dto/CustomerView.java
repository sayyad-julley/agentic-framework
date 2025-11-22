package com.hms.servicename.projector.dto;

import java.io.Serializable;

// This is the denormalized read model we will store in Redis
public class CustomerView implements Serializable {

    private String id;
    private String name;
    private String email;
    private int orderCount;
    
    // Getters and setters...
    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(int orderCount) {
        this.orderCount = orderCount;
    }
}

