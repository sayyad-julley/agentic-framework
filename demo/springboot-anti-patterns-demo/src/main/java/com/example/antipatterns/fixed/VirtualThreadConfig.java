package com.example.antipatterns.fixed;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * FIXED: Virtual Thread Executor Configuration
 * 
 * Solution: Replace fixed thread pools with Virtual Thread executor
 * (Executors.newVirtualThreadPerTaskExecutor()). Virtual threads are
 * lightweight and can scale to millions of concurrent tasks.
 */
@Configuration
@EnableAsync
public class VirtualThreadConfig {
    
    /**
     * FIXED: Virtual thread executor instead of fixed thread pool
     * Virtual threads can scale to handle millions of concurrent tasks
     */
    @Bean(name = "virtualThreadExecutor")
    public Executor virtualThreadExecutor() {
        // ✅ FIXED: Using virtual threads instead of fixed thread pool
        return Executors.newVirtualThreadPerTaskExecutor();
    }
    
    /**
     * FIXED: Alternative: Bounded elastic scheduler for blocking operations
     * Use this for blocking I/O operations in reactive contexts
     */
    @Bean(name = "boundedElasticExecutor")
    public Executor boundedElasticExecutor() {
        // ✅ FIXED: Bounded elastic scheduler for blocking operations
        // This is useful when you need to limit resource usage
        // Using Virtual Thread executor as alternative to bounded elastic
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}

