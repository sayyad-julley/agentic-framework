package com.example.antipatterns.fixed;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * FIXED: RestClient Instead of RestTemplate
 * 
 * Solution: Migrate to RestClient with timeout configuration and error handling.
 * RestClient is the modern replacement for RestTemplate with better API design.
 */
@Service
public class RestClientService {
    
    private static final Logger log = LoggerFactory.getLogger(RestClientService.class);
    
    // ✅ FIXED: Using RestClient instead of deprecated RestTemplate
    private final RestClient restClient;
    
    public RestClientService() {
        // ✅ FIXED: Configure timeout using SimpleClientHttpRequestFactory
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());
        
        // ✅ FIXED: Build RestClient with timeout and error handling
        this.restClient = RestClient.builder()
                .baseUrl("https://api.example.com")
                .requestFactory(factory)
                // ✅ FIXED: Configure error handling
                .defaultStatusHandler(
                        org.springframework.http.HttpStatusCode::is4xxClientError,
                        (request, response) -> {
                            throw new RuntimeException("Client error: " + response.getStatusCode());
                        }
                )
                .defaultStatusHandler(
                        org.springframework.http.HttpStatusCode::is5xxServerError,
                        (request, response) -> {
                            throw new RuntimeException("Server error: " + response.getStatusCode());
                        }
                )
                .build();
    }
    
    /**
     * FIXED: Using RestClient for HTTP calls
     */
    public String fetchData(String url) {
        // ✅ FIXED: RestClient with fluent API
        return restClient.get()
                .uri(url)
                .retrieve()
                .body(String.class);
    }
    
    /**
     * FIXED: Using RestClient with POST
     */
    public String postData(String url, Object data) {
        // ✅ FIXED: RestClient with fluent API and error handling
        return restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(data)
                .retrieve()
                .body(String.class);
    }
    
    /**
     * FIXED: Using RestClient with custom headers
     */
    public String fetchWithHeaders(String url) {
        // ✅ FIXED: RestClient with fluent API for headers
        return restClient.get()
                .uri(url)
                .header("Authorization", "Bearer token")
                .retrieve()
                .body(String.class);
    }
    
    /**
     * FIXED: Using RestClient with error handling
     */
    public String fetchWithErrorHandling(String url) {
        // ✅ FIXED: RestClient with explicit error handling
        try {
            return restClient.get()
                    .uri(url)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError() || status.is5xxServerError(),
                            (request, response) -> {
                                throw new RuntimeException("HTTP error: " + response.getStatusCode());
                            }
                    )
                    .body(String.class);
        } catch (Exception e) {
            log.error("Error fetching data from {}", url, e);
            throw e;
        }
    }
}

