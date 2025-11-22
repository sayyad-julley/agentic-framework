package com.example.flyway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Flyway Enterprise Best Practices Demo Application
 * 
 * Demonstrates production-ready Flyway implementation following enterprise patterns:
 * - Dedicated Migration Users pattern
 * - Directory Separation Pattern
 * - Atomic Change Pattern
 * - Validation-First CI/CD
 * - Idempotent Repeatable Migrations
 * - Java Migration with Transaction Management
 * - Callback Lifecycle Hooks
 */
@SpringBootApplication
public class FlywayDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(FlywayDemoApplication.class, args);
    }
}

