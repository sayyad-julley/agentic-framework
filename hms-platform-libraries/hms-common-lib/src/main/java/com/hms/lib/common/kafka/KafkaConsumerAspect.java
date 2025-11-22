package com.hms.lib.common.kafka;

import com.hms.lib.common.context.ContextHeaders;
import com.hms.lib.common.context.TenantContext;
import com.hms.lib.common.context.UserContext;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * AOP Aspect that automatically restores context from Kafka message headers
 * when processing messages via @KafkaListener methods.
 * 
 * This ensures that context (Tenant ID, User ID, Org ID, Trace ID) propagates
 * from the producer through Kafka to the consumer, allowing proper multi-tenancy
 * and observability in async message processing.
 * 
 * The aspect:
 * 1. Intercepts all @KafkaListener methods
 * 2. Extracts context from Kafka record headers
 * 3. Restores context to ThreadLocal before method execution
 * 4. Cleans up context after method execution
 */
/**
 * Conditional aspect that only loads when Kafka classes are available.
 * This prevents ClassNotFoundException in services that don't use Kafka.
 */
@Aspect
@Component
@ConditionalOnClass(name = "org.apache.kafka.clients.consumer.ConsumerRecord")
public class KafkaConsumerAspect {

    /**
     * Around advice that intercepts @KafkaListener methods.
     * Extracts context from Kafka headers and restores it to ThreadLocal.
     * 
     * @param joinPoint The join point (the @KafkaListener method)
     * @return The result of the method execution
     * @throws Throwable Any exception thrown by the method
     */
    @Around("@annotation(org.springframework.kafka.annotation.KafkaListener)")
    public Object propagateContext(ProceedingJoinPoint joinPoint) throws Throwable {
        try {
            // Find the ConsumerRecord argument to extract headers
            for (Object arg : joinPoint.getArgs()) {
                if (arg instanceof ConsumerRecord<?, ?> record) {
                    extractAndSetContext(record);
                    break; // Only process the first ConsumerRecord found
                }
            }

            // Execute the original method with context restored
            return joinPoint.proceed();
        } finally {
            // Always clean up context after message processing
            // This prevents thread poisoning in Kafka consumer thread pools
            TenantContext.clear();
            UserContext.clear();
            MDC.clear();
        }
    }

    /**
     * Extracts context from Kafka record headers and sets it in ThreadLocal.
     * 
     * @param record The Kafka consumer record
     */
    private void extractAndSetContext(ConsumerRecord<?, ?> record) {
        // Use lowercase headers (Kafka is case-sensitive)
        // Also check for legacy uppercase headers for backward compatibility
        getHeader(record, ContextHeaders.TENANT_ID, TenantContext::setTenantId);
        getHeader(record, ContextHeaders.USER_ID, UserContext::setUserId);
        getHeader(record, ContextHeaders.ORG_ID, UserContext::setOrgId);
        getHeader(record, ContextHeaders.TRACE_ID, val -> MDC.put("traceId", val));
        
        // Backward compatibility: Check uppercase headers if lowercase not found
        if (TenantContext.getTenantId() == null) {
            getHeader(record, "X-Hms-Tenant-Id", TenantContext::setTenantId);
        }
        if (UserContext.getUserId() == null) {
            getHeader(record, "X-Hms-User-Id", UserContext::setUserId);
        }
        if (UserContext.getOrgId() == null) {
            getHeader(record, "X-Hms-Org-Id", UserContext::setOrgId);
        }
        if (MDC.get("traceId") == null) {
            getHeader(record, "X-Hms-Trace-Id", val -> MDC.put("traceId", val));
        }
    }

    /**
     * Extracts a header value from the Kafka record and applies it via a setter function.
     * 
     * @param record The Kafka consumer record
     * @param key The header key (case-sensitive in Kafka)
     * @param setter The function to set the value (e.g., TenantContext::setTenantId)
     */
    private void getHeader(ConsumerRecord<?, ?> record, String key, java.util.function.Consumer<String> setter) {
        var header = record.headers().lastHeader(key);
        if (header != null && header.value() != null) {
            String value = new String(header.value(), StandardCharsets.UTF_8);
            if (!value.isBlank()) {
                setter.accept(value);
            }
        }
    }
}

