package com.example.antipatterns.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * ANTI-PATTERN Configuration: Fixed Thread Pool
 * 
 * This configuration demonstrates the anti-pattern of using fixed thread pools.
 * DO NOT use this in production - see VirtualThreadConfig for the fix.
 */
@Configuration
@EnableAsync
public class FixedThreadPoolConfig {
    
    /**
     * ANTI-PATTERN: Fixed thread pool executor
     * This limits concurrency to 10 threads, causing performance degradation
     * when load exceeds this limit.
     */
    @Bean(name = "fixedThreadPoolExecutor")
    public Executor fixedThreadPoolExecutor() {
        // ❌ ANTI-PATTERN: Fixed thread pool with limited capacity
        return Executors.newFixedThreadPool(10);
    }
}

