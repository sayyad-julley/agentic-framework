package com.example.flowable.examples;

import com.example.flowable.monitoring.JobExecutorMonitor;
import org.flowable.engine.ProcessEngine;
import org.flowable.engine.ProcessEngineConfiguration;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Example: Job Executor Pool Monitoring
 * 
 * Demonstrates the best practice of monitoring act_ru_job table
 * to detect Job Executor pool exhaustion early
 */
public class JobExecutorMonitorExample {
    
    private static final Logger logger = LoggerFactory.getLogger(JobExecutorMonitorExample.class);
    
    public static void main(String[] args) {
        logger.info("=== Job Executor Monitoring Example ===");
        
        // Create Process Engine with proper Job Executor configuration
        ProcessEngineConfiguration cfg = ProcessEngineConfiguration
            .createStandaloneProcessEngineConfiguration()
            .setJdbcUrl("jdbc:h2:mem:flowable;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
            .setJdbcDriver("org.h2.Driver")
            .setJdbcUsername("sa")
            .setJdbcPassword("")
            .setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE)
            // ✅ BEST PRACTICE: Configure Job Executor pool size
            // Note: Pool size configuration is done via AsyncExecutor interface
            // For production, configure via flowable.cfg.xml or properties file
            .setAsyncExecutorActivate(true);
        
        ProcessEngine processEngine = cfg.buildProcessEngine();
        
        // Deploy process definitions
        processEngine.getRepositoryService()
            .createDeployment()
            .addClasspathResource("processes/parallel-join-async.bpmn20.xml")
            .deploy();
        
        // Create monitor
        JobExecutorMonitor monitor = new JobExecutorMonitor(processEngine);
        
        // Initial monitoring
        logger.info("\n--- Initial Job Queue Status ---");
        monitor.monitorJobQueue();
        
        RuntimeService runtimeService = processEngine.getRuntimeService();
        
        // Start multiple process instances to create jobs
        logger.info("\n--- Starting multiple process instances ---");
        for (int i = 0; i < 5; i++) {
            ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("parallelJoinAsync");
            logger.info("Started process instance: {}", processInstance.getId());
        }
        
        // Monitor after starting processes
        logger.info("\n--- Job Queue Status After Starting Processes ---");
        monitor.monitorJobQueue();
        
        // Wait for jobs to process
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Final monitoring
        logger.info("\n--- Final Job Queue Status ---");
        JobExecutorMonitor.JobStatistics stats = monitor.getJobStatistics();
        logger.info("Job Statistics: {}", stats);
        
        if (stats.getUnlockedJobs() > 50) {
            logger.warn("⚠️  Consider increasing Job Executor pool size!");
            logger.warn("Current configuration:");
            logger.warn("  - Configure pool size via flowable.cfg.xml or application.properties");
            logger.warn("  - Monitor act_ru_job table regularly for backlogs");
        } else {
            logger.info("✅ Job Executor pool size is adequate");
        }
        
        // Shutdown
        processEngine.close();
        logger.info("\n=== Example completed ===");
    }
}

