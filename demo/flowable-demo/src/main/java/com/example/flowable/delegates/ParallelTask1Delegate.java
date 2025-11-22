package com.example.flowable.delegates;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Parallel Task 1 Delegate
 * Demonstrates one branch of parallel execution
 */
public class ParallelTask1Delegate implements JavaDelegate {
    
    private static final Logger logger = LoggerFactory.getLogger(ParallelTask1Delegate.class);
    
    @Override
    public void execute(DelegateExecution execution) {
        logger.info("Executing Parallel Task 1 for process instance: {}", execution.getProcessInstanceId());
        
        // Simulate some work
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Set result for this parallel branch
        execution.setVariable("task1Result", "Task 1 completed successfully");
        logger.info("Parallel Task 1 completed");
    }
}

