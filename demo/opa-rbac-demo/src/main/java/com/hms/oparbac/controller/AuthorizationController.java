package com.hms.oparbac.controller;

import com.hms.oparbac.dto.OpaRequest;
import com.hms.oparbac.service.OpaAuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for authorization checks
 * 
 * Integrates with Spring Security OAuth2 Resource Server
 * Extracts user roles from JWT token and delegates to OPA
 */
@Slf4j
@RestController
@RequestMapping("/api/authz")
@RequiredArgsConstructor
public class AuthorizationController {

    private final OpaAuthorizationService opaAuthorizationService;

    /**
     * Check if current user is authorized for an action
     * 
     * @param jwt JWT token from Spring Security (optional for testing)
     * @param action Action to check
     * @param resourceType Optional resource type
     * @param resourceOwner Optional resource owner
     * @param userId Optional user ID (for testing without JWT)
     * @param roles Optional roles (for testing without JWT)
     * @return Authorization result
     */
    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuthorization(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String resourceOwner,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) List<String> roles) {
        
        // Use provided params or extract from JWT
        if (userId == null && jwt != null) {
            userId = jwt.getSubject();
        }
        if (userId == null) {
            userId = "test-user";
        }
        
        if (roles == null || roles.isEmpty()) {
            if (jwt != null) {
                roles = jwt.getClaimAsStringList("roles");
            }
            if (roles == null || roles.isEmpty()) {
                roles = List.of("guest"); // Default role
            }
        }
        
        OpaRequest request = OpaRequest.builder()
                .userId(userId)
                .roles(roles)
                .action(action)
                .resourceType(resourceType)
                .resourceOwner(resourceOwner)
                .build();
        
        boolean authorized = opaAuthorizationService.isAuthorized(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("authorized", authorized);
        response.put("user_id", userId);
        response.put("roles", roles);
        response.put("action", action);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get permissions for current user
     * 
     * @param jwt JWT token from Spring Security (optional for testing)
     * @param userId Optional user ID (for testing without JWT)
     * @param roles Optional roles (for testing without JWT)
     * @return User permissions
     */
    @GetMapping("/permissions")
    public ResponseEntity<Map<String, Object>> getPermissions(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) List<String> roles) {
        
        // Use provided params or extract from JWT
        if (userId == null && jwt != null) {
            userId = jwt.getSubject();
        }
        if (userId == null) {
            userId = "test-user";
        }
        
        if (roles == null || roles.isEmpty()) {
            if (jwt != null) {
                roles = jwt.getClaimAsStringList("roles");
            }
            if (roles == null || roles.isEmpty()) {
                roles = List.of("guest");
            }
        }
        
        List<String> permissions = opaAuthorizationService.getUserPermissions(userId, roles);
        
        Map<String, Object> response = new HashMap<>();
        response.put("user_id", userId);
        response.put("roles", roles);
        response.put("permissions", permissions);
        
        return ResponseEntity.ok(response);
    }
}

