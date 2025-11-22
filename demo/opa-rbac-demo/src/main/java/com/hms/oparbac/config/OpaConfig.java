package com.hms.oparbac.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration for Open Policy Agent integration
 * 
 * Following OPA production patterns:
 * - Centralized Control Plane / Decentralized Enforcement
 * - Policy-Data Separation
 * - Client-side caching for high-QPS scenarios
 */
@Configuration
public class OpaConfig {

    @Value("${opa.url:http://localhost:8181}")
    private String opaUrl;

    @Value("${opa.timeout:5000}")
    private int timeout;

    /**
     * WebClient for OPA REST API communication
     * Uses reactive client for non-blocking I/O
     */
    @Bean
    public WebClient opaWebClient() {
        return WebClient.builder()
                .baseUrl(opaUrl)
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(1024 * 1024)) // 1MB max
                .build();
    }
}

