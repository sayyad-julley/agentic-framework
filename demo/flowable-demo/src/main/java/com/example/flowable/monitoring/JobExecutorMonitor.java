package com.example.flowable.monitoring;

import org.flowable.engine.ProcessEngine;
import org.flowable.engine.ManagementService;
import org.flowable.job.api.Job;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Job Executor Monitor
 * 
 * Best Practice: Monitor act_ru_job table for job backlogs
 * This helps detect Job Executor pool exhaustion early
 * 
 * Anti-Pattern Avoided: Not monitoring job table, missing early warning signs
 */
public class JobExecutorMonitor {
    
    private static final Logger logger = LoggerFactory.getLogger(JobExecutorMonitor.class);
    
    private final ManagementService managementService;
    
    public JobExecutorMonitor(ProcessEngine processEngine) {
        this.managementService = processEngine.getManagementService();
    }
    
    /**
     * Monitor job queue status
     * Best Practice: Regularly check for job backlogs
     */
    public void monitorJobQueue() {
        // Get all jobs
        List<Job> allJobs = managementService.createJobQuery().list();
        
        // Get failed jobs
        List<Job> failedJobs = managementService.createJobQuery()
            .withException()
            .list();
        
        // Count jobs by type (if available)
        long timerJobs = managementService.createTimerJobQuery().count();
        long suspendedJobs = managementService.createSuspendedJobQuery().count();
        long deadLetterJobs = managementService.createDeadLetterJobQuery().count();
        
        logger.info("=== Job Executor Status ===");
        logger.info("Total jobs: {}", allJobs.size());
        logger.info("Timer jobs: {}", timerJobs);
        logger.info("Suspended jobs: {}", suspendedJobs);
        logger.info("Dead letter jobs: {}", deadLetterJobs);
        logger.info("Failed jobs: {}", failedJobs.size());
        
        // Warning if backlog is building up
        if (allJobs.size() > 50) {
            logger.warn("⚠️  Job backlog detected! {} jobs in queue. Consider increasing Job Executor pool size.", 
                allJobs.size());
        }
        
        // Alert if many failed jobs
        if (failedJobs.size() > 0) {
            logger.error("❌ {} failed jobs detected. Review job exceptions.", failedJobs.size());
            for (Job failedJob : failedJobs) {
                logger.error("Failed job ID: {}, Exception: {}", failedJob.getId(), failedJob.getExceptionMessage());
            }
        }
        
        logger.info("===========================");
    }
    
    /**
     * Get job statistics
     */
    public JobStatistics getJobStatistics() {
        List<Job> allJobs = managementService.createJobQuery().list();
        List<Job> failedJobs = managementService.createJobQuery()
            .withException()
            .list();
        long timerJobs = managementService.createTimerJobQuery().count();
        long suspendedJobs = managementService.createSuspendedJobQuery().count();
        long deadLetterJobs = managementService.createDeadLetterJobQuery().count();
        
        // Calculate available jobs (total - failed - suspended - dead letter)
        int availableJobs = (int) (allJobs.size() - failedJobs.size() - suspendedJobs - deadLetterJobs);
        
        return new JobStatistics(
            allJobs.size(),
            availableJobs,
            (int) suspendedJobs,
            failedJobs.size()
        );
    }
    
    /**
     * Job statistics data class
     */
    public static class JobStatistics {
        private final int totalJobs;
        private final int availableJobs;
        private final int suspendedJobs;
        private final int failedJobs;
        
        public JobStatistics(int totalJobs, int availableJobs, int suspendedJobs, int failedJobs) {
            this.totalJobs = totalJobs;
            this.availableJobs = availableJobs;
            this.suspendedJobs = suspendedJobs;
            this.failedJobs = failedJobs;
        }
        
        public int getTotalJobs() {
            return totalJobs;
        }
        
        public int getAvailableJobs() {
            return availableJobs;
        }
        
        public int getUnlockedJobs() {
            return availableJobs; // Alias for backward compatibility
        }
        
        public int getSuspendedJobs() {
            return suspendedJobs;
        }
        
        public int getFailedJobs() {
            return failedJobs;
        }
        
        @Override
        public String toString() {
            return String.format("JobStatistics{total=%d, available=%d, suspended=%d, failed=%d}", 
                totalJobs, availableJobs, suspendedJobs, failedJobs);
        }
    }
}

