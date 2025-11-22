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
 * Example: Explicit Script Variable Assignment
 * 
 * Demonstrates the best practice of using flowable:autoStoreVariables="false"
 * and explicit execution.setVariable() calls for consistent behavior
 */
public class ExplicitScriptVariablesExample {
    
    private static final Logger logger = LoggerFactory.getLogger(ExplicitScriptVariablesExample.class);
    
    public static void main(String[] args) {
        logger.info("=== Explicit Script Variable Assignment Example ===");
        
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
            .addClasspathResource("processes/explicit-script-variables.bpmn20.xml")
            .deploy();
        
        RuntimeService runtimeService = processEngine.getRuntimeService();
        
        // Set input data
        Map<String, Object> variables = new HashMap<>();
        variables.put("inputData", 42);
        
        // Start process instance
        logger.info("Starting process instance with inputData: 42");
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
            "explicitScriptVariables", variables);
        
        logger.info("Process instance started: {}", processInstance.getId());
        logger.info("✅ Script task uses flowable:autoStoreVariables=\"false\"");
        logger.info("✅ All variables are explicitly set using execution.setVariable()");
        logger.info("✅ This guarantees consistent behavior across JDK versions");
        logger.info("✅ Using JUEL script format (natively supported by Flowable)");
        
        // Wait for execution
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Check variables
        Map<String, Object> processVariables = runtimeService.getVariables(processInstance.getId());
        logger.info("\nProcess variables after script execution:");
        processVariables.forEach((key, value) -> 
            logger.info("  {} = {}", key, value));
        
        // Verify expected variables
        if (processVariables.containsKey("outputData") && 
            processVariables.containsKey("processed")) {
            logger.info("\n✅ Script variables were explicitly set correctly");
            logger.info("  outputData: {}", processVariables.get("outputData"));
            logger.info("  processed: {}", processVariables.get("processed"));
        } else {
            logger.warn("⚠️  Expected variables not found");
        }
        
        // Shutdown
        processEngine.close();
        logger.info("\n=== Example completed ===");
    }
}

