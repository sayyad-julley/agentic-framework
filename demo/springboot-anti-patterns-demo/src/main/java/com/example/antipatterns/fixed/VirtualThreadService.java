package com.example.antipatterns.fixed;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * FIXED: Virtual Thread Service
 * 
 * Solution: Using virtual thread executor configured in VirtualThreadConfig.
 * Virtual threads can scale to handle millions of concurrent tasks without
 * the limitations of fixed thread pools.
 */
@Service
public class VirtualThreadService {
    
    private static final Logger log = LoggerFactory.getLogger(VirtualThreadService.class);
    
    /**
     * FIXED: Using virtual thread executor for async operations
     * Can handle millions of concurrent tasks without queuing
     */
    @Async("virtualThreadExecutor")  // ✅ FIXED: Using virtual thread executor
    public CompletableFuture<String> processTask(String taskId) {
        log.info("Processing task {} on virtual thread {}", taskId, Thread.currentThread().getName());
        
        // Simulating work
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        return CompletableFuture.completedFuture("Task " + taskId + " completed");
    }
    
    /**
     * FIXED: Virtual threads can handle high concurrency
     */
    @Async("virtualThreadExecutor")  // ✅ FIXED: Using virtual thread executor
    public CompletableFuture<String> processHighConcurrencyTask(String taskId) {
        log.info("Processing high concurrency task {} on virtual thread {}", 
                taskId, Thread.currentThread().getName());
        
        // Simulating work that might block
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        return CompletableFuture.completedFuture("High concurrency task " + taskId + " completed");
    }
}

