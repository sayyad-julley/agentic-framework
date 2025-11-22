package com.hms.oparbac.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Request DTO for OPA policy evaluation
 * 
 * Input structure matches Rego policy expectations:
 * - user_id: String identifier for the user
 * - roles: Array of role names assigned to user
 * - action: Action being requested (read, write, delete, etc.)
 * - resource_type: Optional resource type for resource-level permissions
 * - resource_owner: Optional owner ID for ownership checks
 * - user: Optional user object for multi-tenant scenarios
 * - resource: Optional resource object for multi-tenant scenarios
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpaRequest {
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("roles")
    private List<String> roles;
    
    @JsonProperty("action")
    private String action;
    
    @JsonProperty("resource_type")
    private String resourceType;
    
    @JsonProperty("resource_owner")
    private String resourceOwner;
    
    @JsonProperty("user")
    private UserContext user;
    
    @JsonProperty("resource")
    private ResourceContext resource;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserContext {
        @JsonProperty("tenant_id")
        private String tenantId;
        
        @JsonProperty("account_locked")
        private Boolean accountLocked;
        
        @JsonProperty("roles")
        private List<String> roles;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceContext {
        @JsonProperty("tenant_id")
        private String tenantId;
        
        @JsonProperty("resource_id")
        private String resourceId;
        
        @JsonProperty("resource_type")
        private String resourceType;
    }
}

