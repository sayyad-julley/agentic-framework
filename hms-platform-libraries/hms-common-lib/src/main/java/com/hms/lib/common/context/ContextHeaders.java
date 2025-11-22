package com.hms.lib.common.context;

/**
 * Standard header names for context propagation across services.
 * 
 * CRITICAL: Kafka headers are case-sensitive, while HTTP headers are case-insensitive.
 * We use lowercase for maximum compatibility across all systems.
 * 
 * HTTP services can read headers in any case (X-Hms-Tenant-Id, x-hms-tenant-id, etc.),
 * but when writing to Kafka, always use the lowercase constants defined here.
 */
public final class ContextHeaders {

    private ContextHeaders() {
        // Utility class - prevent instantiation
    }

    /**
     * Trace ID header for correlation across services.
     * Used for distributed tracing and log correlation.
     */
    public static final String TRACE_ID = "x-hms-trace-id";

    /**
     * Tenant ID header for multi-tenancy isolation.
     * Required for proper data isolation in multi-tenant systems.
     */
    public static final String TENANT_ID = "x-hms-tenant-id";

    /**
     * User ID header for audit and authorization.
     * Identifies the user who initiated the request.
     */
    public static final String USER_ID = "x-hms-user-id";

    /**
     * Organization ID header for organizational context.
     * Identifies the organization the user belongs to.
     */
    public static final String ORG_ID = "x-hms-org-id";

    /**
     * Legacy trace ID header (for backward compatibility).
     * Some systems may still use X-Trace-Id.
     */
    public static final String LEGACY_TRACE_ID = "x-trace-id";
}

