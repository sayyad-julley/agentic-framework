package com.hms.lib.common.config;

import com.hms.lib.common.context.TenantContext;
import com.hms.lib.common.context.UserContext;
import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskDecorator;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.concurrent.Executor;

/**
 * Configuration for async context propagation.
 * Ensures that ThreadLocal context (TenantContext, UserContext, SecurityContext, MDC)
 * is propagated from parent thread to async child threads.
 * 
 * This fixes the issue where @Async methods lose context because Spring spawns
 * a new thread and ThreadLocal values don't automatically transfer.
 */
@Configuration
public class AsyncContextConfiguration {

    /**
     * Configures the default task executor with context propagation.
     * This bean is automatically used by @Async methods.
     * 
     * @return Executor with context propagation support
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("hms-async-");
        // CRITICAL: Inject the decorator to propagate context
        executor.setTaskDecorator(new ContextPropagatingTaskDecorator());
        executor.initialize();
        return executor;
    }

    /**
     * TaskDecorator that captures ThreadLocal context from the caller thread
     * and restores it in the async execution thread.
     * 
     * This ensures that:
     * - TenantContext is available in async methods
     * - UserContext is available in async methods
     * - SecurityContext is available in async methods
     * - MDC (logging context) is available in async methods
     */
    static class ContextPropagatingTaskDecorator implements TaskDecorator {
        
        @Override
        public Runnable decorate(Runnable runnable) {
            // 1. SNAPSHOT: Capture context from the PARENT thread
            String tenantId = TenantContext.getTenantId();
            String userId = UserContext.getUserId();
            String orgId = UserContext.getOrgId();
            SecurityContext securityContext = SecurityContextHolder.getContext();
            Map<String, String> mdcContext = MDC.getCopyOfContextMap();

            return () -> {
                try {
                    // 2. RESTORE: Hydrate the CHILD thread with captured context
                    if (tenantId != null) {
                        TenantContext.setTenantId(tenantId);
                    }
                    if (userId != null) {
                        UserContext.setUserId(userId);
                    }
                    if (orgId != null) {
                        UserContext.setOrgId(orgId);
                    }
                    if (securityContext != null) {
                        SecurityContextHolder.setContext(securityContext);
                    }
                    if (mdcContext != null) {
                        MDC.setContextMap(mdcContext);
                    }

                    // 3. EXECUTE: Run the original task with context restored
                    runnable.run();
                } finally {
                    // 4. CLEANUP: Prevent thread poisoning by clearing context
                    // This is critical for thread pool reuse
                    TenantContext.clear();
                    UserContext.clear();
                    SecurityContextHolder.clearContext();
                    MDC.clear();
                }
            };
        }
    }
}

