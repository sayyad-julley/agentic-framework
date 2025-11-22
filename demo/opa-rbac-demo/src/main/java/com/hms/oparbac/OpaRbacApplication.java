package com.hms.oparbac;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Main Spring Boot application for OPA RBAC demo
 */
@SpringBootApplication
// @EnableCaching  // Temporarily disabled
public class OpaRbacApplication {

    public static void main(String[] args) {
        SpringApplication.run(OpaRbacApplication.class, args);
    }
}

