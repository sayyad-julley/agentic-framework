package com.example.antipatterns.antipattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * ANTI-PATTERN: Fixed Thread Pools
 * 
 * Problem: Using Executors.newFixedThreadPool(10) for async operations.
 * Imposes fixed ceiling on concurrency, degrades when load exceeds thread count.
 * 
 * This service demonstrates the anti-pattern by using fixed thread pools.
 */
@Service
public class FixedThreadPoolService {
    
    private static final Logger log = LoggerFactory.getLogger(FixedThreadPoolService.class);
    
    // ❌ ANTI-PATTERN: Fixed thread pool with limited capacity
    private final Executor fixedThreadPool = Executors.newFixedThreadPool(10);
    
    /**
     * ANTI-PATTERN: Using fixed thread pool for async operations
     * When load exceeds 10 concurrent tasks, they queue up and degrade performance
     */
    @Async("fixedThreadPoolExecutor")
    public CompletableFuture<String> processTask(String taskId) {
        log.info("Processing task {} on thread {}", taskId, Thread.currentThread().getName());
        
        // Simulating work
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        return CompletableFuture.completedFuture("Task " + taskId + " completed");
    }
    
    /**
     * ANTI-PATTERN: Manual fixed thread pool usage
     */
    public CompletableFuture<String> processWithFixedPool(String taskId) {
        CompletableFuture<String> future = new CompletableFuture<>();
        
        // ❌ ANTI-PATTERN: Submitting to fixed thread pool
        fixedThreadPool.execute(() -> {
            try {
                log.info("Processing task {} on thread {}", taskId, Thread.currentThread().getName());
                Thread.sleep(1000);
                future.complete("Task " + taskId + " completed");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                future.completeExceptionally(e);
            }
        });
        
        return future;
    }
}

