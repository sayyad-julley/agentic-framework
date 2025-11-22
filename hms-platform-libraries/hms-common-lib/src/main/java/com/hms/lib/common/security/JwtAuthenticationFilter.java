package com.hms.lib.common.security;

import com.hms.lib.common.context.ContextHeaders;
import com.hms.lib.common.context.TenantContext;
import com.hms.lib.common.context.UserContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            // Read or generate trace ID
            // HTTP headers are case-insensitive, so check multiple variations
            String traceId = request.getHeader("X-Trace-Id");
            if (traceId == null || traceId.isBlank()) {
                traceId = request.getHeader("X-Hms-Trace-Id");
            }
            if (traceId == null || traceId.isBlank()) {
                traceId = request.getHeader(ContextHeaders.TRACE_ID);
            }
            if (traceId == null || traceId.isBlank()) {
                traceId = UUID.randomUUID().toString();
            }
            MDC.put("traceId", traceId);

            // Propagate trace ID in response header for downstream services
            // Use lowercase for consistency (HTTP is case-insensitive, but lowercase is standard)
            response.setHeader(ContextHeaders.TRACE_ID, traceId);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                String userId = jwt.getSubject();
                String orgId = jwt.getClaimAsString("org_id");
                String tenantId = orgId;

                if (userId != null) {
                    UserContext.setUserId(userId);
                    MDC.put("userId", userId);
                }

                if (orgId != null) {
                    UserContext.setOrgId(orgId);
                    MDC.put("orgId", orgId);
                }

                if (tenantId != null) {
                    TenantContext.setTenantId(tenantId);
                    MDC.put("tenantId", tenantId);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            UserContext.clear();
            TenantContext.clear();
            MDC.clear();
        }
    }
}
