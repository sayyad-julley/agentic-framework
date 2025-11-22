package com.hms.oparbac.service;

import com.hms.oparbac.dto.OpaRequest;
import com.hms.oparbac.dto.OpaResponse;
import com.hms.oparbac.exception.AuthorizationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for OPA authorization decisions
 * 
 * Implements best practices:
 * - Client-side caching for high-QPS scenarios
 * - Retry logic with exponential backoff
 * - Timeout handling
 * - Error handling and logging
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OpaAuthorizationService {

    private final WebClient opaWebClient;

    @Value("${opa.policy.path:policy.rbac.allow}")
    private String policyPath;

    @Value("${opa.cache.enabled:true}")
    private boolean cacheEnabled;

    /**
     * Check if user is authorized for an action
     * 
     * @param request OPA authorization request
     * @return true if authorized, false otherwise
     * @throws AuthorizationException if authorization check fails
     */
    @Cacheable(value = "opaDecisions", key = "#request.userId + ':' + #request.action + ':' + #request.resourceType", 
               condition = "#root.target.cacheEnabled")
    public boolean isAuthorized(OpaRequest request) {
        try {
            // OPA returns {"result": true/false} directly
            Map<String, Object> response = evaluatePolicyRaw(request).block();
            
            if (response == null) {
                log.warn("OPA returned null response for user: {}", request.getUserId());
                return false;
            }
            
            log.debug("OPA response: {}", response);
            
            if (!response.containsKey("result")) {
                log.warn("OPA returned invalid response (no 'result' key) for user: {}, response: {}", request.getUserId(), response);
                return false;
            }
            
            Object result = response.get("result");
            boolean allowed = Boolean.TRUE.equals(result);
            
            log.debug("Authorization result for user {}: {}", request.getUserId(), allowed);
            
            return allowed;
        } catch (WebClientResponseException e) {
            log.error("OPA request failed: {}", e.getMessage(), e);
            throw new AuthorizationException("Failed to evaluate authorization policy", e);
        } catch (Exception e) {
            log.error("Unexpected error during authorization check", e);
            throw new AuthorizationException("Authorization check failed", e);
        }
    }

    /**
     * Evaluate OPA policy with retry logic - returns raw Map
     * 
     * Uses exponential backoff for resilience
     */
    @SuppressWarnings("unchecked")
    private Mono<Map<String, Object>> evaluatePolicyRaw(OpaRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("input", request);
        
        // OPA path: policy.rbac.allow -> /v1/data/policy/rbac/allow
        String opaPath = "/v1/data/" + policyPath.replace(".", "/");
        log.debug("Calling OPA at path: {}", opaPath);
        
        return opaWebClient
                .post()
                .uri(opaPath)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                .retryWhen(Retry.backoff(3, Duration.ofMillis(100))
                        .filter(throwable -> throwable instanceof WebClientResponseException 
                                && ((WebClientResponseException) throwable).getStatusCode().is5xxServerError())
                        .doBeforeRetry(retrySignal -> 
                                log.warn("Retrying OPA request after failure: {}", retrySignal.totalRetries() + 1)))
                .timeout(Duration.ofSeconds(5))
                .doOnError(error -> log.error("OPA evaluation error", error));
    }
    
    /**
     * Legacy method for compatibility - kept for getUserPermissions
     */
    private Mono<OpaResponse> evaluatePolicy(OpaRequest request) {
        return evaluatePolicyRaw(request)
                .map(response -> {
                    OpaResponse opaResponse = new OpaResponse();
                    OpaResponse.Result result = new OpaResponse.Result();
                    Object resultValue = response.get("result");
                    if (resultValue instanceof Boolean) {
                        result.setAllow((Boolean) resultValue);
                    }
                    opaResponse.setResult(result);
                    return opaResponse;
                });
    }

    /**
     * Get user permissions from OPA
     * 
     * @param userId User identifier
     * @param roles User roles
     * @return List of permissions
     */
    public java.util.List<String> getUserPermissions(String userId, java.util.List<String> roles) {
        OpaRequest request = OpaRequest.builder()
                .userId(userId)
                .roles(roles)
                .action("dummy") // Dummy action to get all permissions
                .build();
        
        try {
            OpaResponse response = evaluatePolicy(request).block();
            if (response != null && response.getResult() != null) {
                return response.getResult().getUserPermissions();
            }
        } catch (Exception e) {
            log.error("Failed to get user permissions", e);
        }
        
        return java.util.Collections.emptyList();
    }
}

