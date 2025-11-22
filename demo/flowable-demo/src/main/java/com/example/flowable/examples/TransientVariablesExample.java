package com.example.flowable.examples;

import org.flowable.engine.ProcessEngine;
import org.flowable.engine.ProcessEngineConfiguration;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Example: Transient Variable Doctrine
 * 
 * Demonstrates the best practice of using transient variables
 * for temporary data to avoid data hoarding and maintain database performance
 */
public class TransientVariablesExample {
    
    private static final Logger logger = LoggerFactory.getLogger(TransientVariablesExample.class);
    
    public static void main(String[] args) {
        logger.info("=== Transient Variable Doctrine Example ===");
        
        // Create Process Engine
        ProcessEngineConfiguration cfg = ProcessEngineConfiguration
            .createStandaloneProcessEngineConfiguration()
            .setJdbcUrl("jdbc:h2:mem:flowable;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
            .setJdbcDriver("org.h2.Driver")
            .setJdbcUsername("sa")
            .setJdbcPassword("")
            .setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE)
            .setAsyncExecutorActivate(true);
        
        ProcessEngine processEngine = cfg.buildProcessEngine();
        
        // Deploy process definition
        processEngine.getRepositoryService()
            .createDeployment()
            .addClasspathResource("processes/transient-variables.bpmn20.xml")
            .deploy();
        
        RuntimeService runtimeService = processEngine.getRuntimeService();
        
        // Set initial variables
        Map<String, Object> variables = new HashMap<>();
        variables.put("serviceEndpoint", "https://api.example.com/orders");
        
        // Start process instance
        logger.info("Starting process instance with service endpoint...");
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
            "transientVariables", variables);
        
        logger.info("Process instance started: {}", processInstance.getId());
        logger.info("✅ Transient variables will be used for API status");
        logger.info("✅ Only essential business data (orderId, customerId) will be persisted");
        logger.info("✅ Status code will be automatically discarded at next wait state");
        
        // Wait for async execution
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Check variables
        Map<String, Object> processVariables = runtimeService.getVariables(processInstance.getId());
        logger.info("Persistent variables: {}", processVariables.keySet());
        logger.info("Note: Transient variables (status, responseTime) are not in this list");
        logger.info("They were automatically discarded after use");
        
        // Shutdown
        processEngine.close();
        logger.info("=== Example completed ===");
    }
}

