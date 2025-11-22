package com.example.flowable.delegates;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Demonstrates Transient Variable Doctrine Best Practice
 * 
 * Pattern: Use transient variables for temporary data (API responses, status codes)
 * Persist only audit-critical business data as process variables
 * 
 * Anti-Pattern Avoided: Data hoarding with persistent variables
 */
public class TransientVariableDelegate implements JavaDelegate {
    
    private static final Logger logger = LoggerFactory.getLogger(TransientVariableDelegate.class);
    
    @Override
    public void execute(DelegateExecution execution) {
        logger.info("Executing TransientVariableDelegate for process instance: {}", execution.getProcessInstanceId());
        
        // Simulate API call response
        String endpoint = (String) execution.getVariable("serviceEndpoint");
        logger.info("Calling endpoint: {}", endpoint);
        
        // Simulate REST API response
        RestResponse restResponse = simulateRestCall(endpoint);
        
        // ✅ BEST PRACTICE: Set status as transient for immediate conditional routing
        // This variable is automatically garbage-collected at next wait state
        execution.setTransientVariable("status", restResponse.getStatus());
        execution.setTransientVariable("responseTime", restResponse.getResponseTime());
        
        // ✅ BEST PRACTICE: Persist only essential business data if call succeeded
        if (restResponse.getStatus() == 200) {
            Map<String, Object> parsedData = parseResponse(restResponse.getBody());
            execution.setVariable("orderId", parsedData.get("orderId")); // Persistent for audit
            execution.setVariable("customerId", parsedData.get("customerId")); // Persistent for audit
            
            logger.info("API call succeeded. Order ID: {}, Customer ID: {}", 
                parsedData.get("orderId"), parsedData.get("customerId"));
        } else {
            logger.warn("API call failed with status: {}", restResponse.getStatus());
        }
        
        // Transient variables can be used in UEL conditions immediately:
        // ${status == 200} in conditional sequence flow
        // These variables will be automatically discarded at next wait state
    }
    
    private RestResponse simulateRestCall(String endpoint) {
        // Simulate API call
        try {
            Thread.sleep(100); // Simulate network latency
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Simulate successful response
        Map<String, Object> body = new HashMap<>();
        body.put("orderId", "ORD-12345");
        body.put("customerId", "CUST-67890");
        
        return new RestResponse(200, body, 150L);
    }
    
    private Map<String, Object> parseResponse(Map<String, Object> body) {
        return body;
    }
    
    // Inner class for response simulation
    private static class RestResponse {
        private final int status;
        private final Map<String, Object> body;
        private final long responseTime;
        
        public RestResponse(int status, Map<String, Object> body, long responseTime) {
            this.status = status;
            this.body = body;
            this.responseTime = responseTime;
        }
        
        public int getStatus() {
            return status;
        }
        
        public Map<String, Object> getBody() {
            return body;
        }
        
        public long getResponseTime() {
            return responseTime;
        }
    }
}

