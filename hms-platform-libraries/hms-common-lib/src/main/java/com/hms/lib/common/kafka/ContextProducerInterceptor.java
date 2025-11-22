package com.hms.lib.common.kafka;

import com.hms.lib.common.context.ContextHeaders;
import com.hms.lib.common.context.TenantContext;
import com.hms.lib.common.context.UserContext;
import org.apache.kafka.clients.producer.ProducerInterceptor;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.slf4j.MDC;

import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Kafka Producer Interceptor that automatically injects context information
 * (Tenant ID, User ID, Org ID, Trace ID) into Kafka message headers.
 * 
 * This ensures that context propagates across process boundaries when messages
 * are sent to Kafka, allowing consumers to restore the context.
 * 
 * Configuration: Add to application.properties:
 * spring.kafka.producer.properties.interceptor.classes=com.hms.lib.common.kafka.ContextProducerInterceptor
 */
public class ContextProducerInterceptor implements ProducerInterceptor<Object, Object> {

    /**
     * Called before a record is sent to Kafka.
     * Extracts context from ThreadLocal and injects it into record headers.
     * 
     * @param record The producer record
     * @return The record with context headers added
     */
    @Override
    public ProducerRecord<Object, Object> onSend(ProducerRecord<Object, Object> record) {
        // Inject Context into Kafka Headers
        // CRITICAL: Use lowercase headers for Kafka (case-sensitive)
        addHeader(record, ContextHeaders.TENANT_ID, TenantContext.getTenantId());
        addHeader(record, ContextHeaders.USER_ID, UserContext.getUserId());
        addHeader(record, ContextHeaders.ORG_ID, UserContext.getOrgId());
        addHeader(record, ContextHeaders.TRACE_ID, MDC.get("traceId"));
        
        return record;
    }

    /**
     * Adds a header to the Kafka record if the value is not null.
     * 
     * @param record The producer record
     * @param key The header key
     * @param value The header value (may be null)
     */
    private void addHeader(ProducerRecord<?, ?> record, String key, String value) {
        if (value != null && !value.isBlank()) {
            record.headers().add(key, value.getBytes(StandardCharsets.UTF_8));
        }
    }

    /**
     * Called when the record is acknowledged by the broker.
     * 
     * @param metadata Record metadata
     * @param exception Exception if any
     */
    @Override
    public void onAcknowledgement(RecordMetadata metadata, Exception exception) {
        // No action needed
    }

    /**
     * Called when the interceptor is closed.
     */
    @Override
    public void close() {
        // No cleanup needed
    }

    /**
     * Called when the interceptor is configured.
     * 
     * @param configs Configuration properties
     */
    @Override
    public void configure(Map<String, ?> configs) {
        // No configuration needed
    }
}

