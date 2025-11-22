package com.hms.oparbac.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO from OPA policy evaluation
 * 
 * Matches OPA REST API response structure:
 * - result: Contains the policy evaluation result
 *   - allow: Boolean indicating if request is authorized
 *   - deny: Array of denial messages (if any)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpaResponse {
    
    @JsonProperty("result")
    private Result result;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {
        @JsonProperty("allow")
        private Boolean allow;
        
        @JsonProperty("deny")
        private List<String> deny;
        
        @JsonProperty("user_permissions")
        private List<String> userPermissions;
    }
}

