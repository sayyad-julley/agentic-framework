package com.hms.oparbac.controller;

import com.hms.oparbac.dto.OpaRequest;
import com.hms.oparbac.service.OpaAuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Example resource controller demonstrating RBAC enforcement
 * 
 * Uses OPA to authorize actions before processing requests
 */
@Slf4j
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final OpaAuthorizationService opaAuthorizationService;

    /**
     * Get resource - requires 'read' permission
     */
    @GetMapping("/{resourceId}")
    public ResponseEntity<Map<String, Object>> getResource(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String resourceId,
            @RequestParam(required = false) String resourceType) {
        
        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null || roles.isEmpty()) {
            roles = List.of("guest");
        }
        
        String userId = jwt.getSubject();
        
        // Check authorization
        OpaRequest request = OpaRequest.builder()
                .userId(userId)
                .roles(roles)
                .action("read")
                .resourceType(resourceType != null ? resourceType : "resource")
                .build();
        
        if (!opaAuthorizationService.isAuthorized(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied", "message", "Insufficient permissions"));
        }
        
        // Return mock resource
        Map<String, Object> resource = new HashMap<>();
        resource.put("id", resourceId);
        resource.put("name", "Sample Resource");
        resource.put("type", resourceType != null ? resourceType : "resource");
        resource.put("owner", userId);
        
        return ResponseEntity.ok(resource);
    }

    /**
     * Create resource - requires 'write' permission
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createResource(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> resourceData) {
        
        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null || roles.isEmpty()) {
            roles = List.of("guest");
        }
        
        String userId = jwt.getSubject();
        
        // Check authorization
        OpaRequest request = OpaRequest.builder()
                .userId(userId)
                .roles(roles)
                .action("write")
                .resourceType((String) resourceData.getOrDefault("type", "resource"))
                .build();
        
        if (!opaAuthorizationService.isAuthorized(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied", "message", "Insufficient permissions"));
        }
        
        // Create resource (mock)
        Map<String, Object> response = new HashMap<>();
        response.put("id", "resource-" + System.currentTimeMillis());
        response.putAll(resourceData);
        response.put("created_by", userId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Delete resource - requires 'delete' permission
     */
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Map<String, Object>> deleteResource(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String resourceId) {
        
        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles == null || roles.isEmpty()) {
            roles = List.of("guest");
        }
        
        String userId = jwt.getSubject();
        
        // Check authorization
        OpaRequest request = OpaRequest.builder()
                .userId(userId)
                .roles(roles)
                .action("delete")
                .resourceType("resource")
                .build();
        
        if (!opaAuthorizationService.isAuthorized(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied", "message", "Insufficient permissions"));
        }
        
        return ResponseEntity.ok(Map.of("message", "Resource deleted", "id", resourceId));
    }
}

