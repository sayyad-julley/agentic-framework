package com.example.flowable.delegates;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Parallel Task 2 Delegate
 * Demonstrates another branch of parallel execution
 */
public class ParallelTask2Delegate implements JavaDelegate {
    
    private static final Logger logger = LoggerFactory.getLogger(ParallelTask2Delegate.class);
    
    @Override
    public void execute(DelegateExecution execution) {
        logger.info("Executing Parallel Task 2 for process instance: {}", execution.getProcessInstanceId());
        
        // Simulate some work
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Set result for this parallel branch
        execution.setVariable("task2Result", "Task 2 completed successfully");
        logger.info("Parallel Task 2 completed");
    }
}

