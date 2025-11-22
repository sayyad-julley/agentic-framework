package com.example.flowable.examples;

import org.flowable.engine.ProcessEngine;
import org.flowable.engine.ProcessEngineConfiguration;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Example: Asynchronous Continuation for Parallel Joins
 * 
 * Demonstrates the best practice of using asynchronous continuation
 * before parallel join gateways to prevent FlowableOptimisticLockingException
 */
public class ParallelJoinAsyncExample {
    
    private static final Logger logger = LoggerFactory.getLogger(ParallelJoinAsyncExample.class);
    
    public static void main(String[] args) {
        logger.info("=== Parallel Join with Async Continuation Example ===");
        
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
            .addClasspathResource("processes/parallel-join-async.bpmn20.xml")
            .deploy();
        
        RuntimeService runtimeService = processEngine.getRuntimeService();
        
        // Start process instance
        logger.info("Starting process instance...");
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("parallelJoinAsync");
        
        logger.info("Process instance started: {}", processInstance.getId());
        logger.info("Process definition key: {}", processInstance.getProcessDefinitionKey());
        
        // Wait for async jobs to complete
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Check process instance status
        ProcessInstance updatedInstance = runtimeService.createProcessInstanceQuery()
            .processInstanceId(processInstance.getId())
            .singleResult();
        
        if (updatedInstance == null) {
            logger.info("✅ Process instance completed successfully!");
            logger.info("The async join markers prevented optimistic locking exceptions");
        } else {
            logger.info("Process instance still running: {}", updatedInstance.getId());
        }
        
        // Shutdown
        processEngine.close();
        logger.info("=== Example completed ===");
    }
}

