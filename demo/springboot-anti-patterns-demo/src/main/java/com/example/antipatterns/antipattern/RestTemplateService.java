package com.example.antipatterns.antipattern;

import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * ANTI-PATTERN: Deprecated RestTemplate
 * 
 * Problem: Continuing to use RestTemplate which is in maintenance mode.
 * RestTemplate is deprecated and Spring recommends migrating to RestClient.
 * 
 * This service demonstrates the anti-pattern by using RestTemplate.
 */
@Service
public class RestTemplateService {
    
    // ❌ ANTI-PATTERN: Using deprecated RestTemplate
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * ANTI-PATTERN: Using deprecated RestTemplate for HTTP calls
     */
    public String fetchData(String url) {
        // ❌ ANTI-PATTERN: RestTemplate is deprecated
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }
    
    /**
     * ANTI-PATTERN: Using deprecated RestTemplate with POST
     */
    public String postData(String url, Object data) {
        // ❌ ANTI-PATTERN: RestTemplate is deprecated
        ResponseEntity<String> response = restTemplate.postForEntity(url, data, String.class);
        return response.getBody();
    }
    
    /**
     * ANTI-PATTERN: Using deprecated RestTemplate with custom headers
     */
    public String fetchWithHeaders(String url) {
        // ❌ ANTI-PATTERN: RestTemplate is deprecated and lacks modern features
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer token");
        
        org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                String.class
        );
        
        return response.getBody();
    }
}

