package com.hms.servicename.tenancy;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver {

    public static final String DEFAULT_TENANT_ID = "public";
    public static final String TENANT_CLAIM_NAME = "org_id"; // Our confirmed assumption

    @Override
    public String resolveCurrentTenantIdentifier() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return DEFAULT_TENANT_ID;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt) {
            Jwt jwt = (Jwt) principal;
            // Extract the organization ID from the JWT 'org_id' claim.
            String tenantId = jwt.getClaimAsString(TENANT_CLAIM_NAME);
            return (tenantId != null) ? tenantId : DEFAULT_TENANT_ID;
        }
        
        // Fallback for non-JWT principals (e.g., during the stateful login flow)
        // A more robust implementation would store this in the HttpSession
        return DEFAULT_TENANT_ID;
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}

