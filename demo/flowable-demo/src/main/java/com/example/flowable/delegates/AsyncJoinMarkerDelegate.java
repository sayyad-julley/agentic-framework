package com.example.flowable.delegates;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Asynchronous Join Marker Delegate
 * 
 * Best Practice: Asynchronous continuation before parallel join gateway
 * This prevents FlowableOptimisticLockingException by delegating join operation
 * to Job Executor, processing in new distinct transaction
 * 
 * Anti-Pattern Avoided: Synchronous parallel gateway joins causing optimistic locking
 */
public class AsyncJoinMarkerDelegate implements JavaDelegate {
    
    private static final Logger logger = LoggerFactory.getLogger(AsyncJoinMarkerDelegate.class);
    
    @Override
    public void execute(DelegateExecution execution) {
        // This is a simple marker delegate that runs asynchronously
        // The async execution ensures the join happens in a separate transaction
        logger.info("Async join marker executed for execution: {} in process instance: {}", 
            execution.getId(), execution.getProcessInstanceId());
        
        // This delegate can be a simple logging delegate or no-op
        // The key is that it runs with flowable:async="true" attribute
        // This separates the join operation from parallel branch execution
    }
}

