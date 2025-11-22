package com.example.antipatterns.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Demo Controller to showcase all anti-patterns
 */
@RestController
@RequestMapping("/api/demo")
public class AntiPatternDemoController {
    
    @GetMapping("/anti-patterns")
    public Map<String, String> listAntiPatterns() {
        return Map.of(
            "1. Transactional Overload", "/api/anti-pattern/transactional-overload/users",
            "2. Business Logic in Controllers", "/api/anti-pattern/business-logic/users",
            "3. Blocking I/O in Reactive Code", "/api/anti-pattern/blocking-io/users",
            "4. Unbounded Caching", "See UnboundedCachingService",
            "5. Fixed Thread Pools", "See FixedThreadPoolService",
            "6. Deprecated RestTemplate", "See RestTemplateService"
        );
    }
    
    @GetMapping("/fixed")
    public Map<String, String> listFixedPatterns() {
        return Map.of(
            "1. Transactional Fixed", "/api/fixed/transactional/users",
            "2. Business Logic Fixed", "/api/fixed/business-logic/users",
            "3. Blocking I/O Fixed", "/api/fixed/blocking-io/users",
            "4. Bounded Caching", "See BoundedCachingService",
            "5. Virtual Threads", "See VirtualThreadService",
            "6. RestClient", "See RestClientService"
        );
    }
}

