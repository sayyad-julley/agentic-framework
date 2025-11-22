package com.example.antipatterns.antipattern;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ANTI-PATTERN: Unbounded Caching
 * 
 * Problem: Using @Cacheable without TTL or maximum size limits.
 * Caches grow indefinitely, leading to OutOfMemory errors and stale data.
 * 
 * This service demonstrates the anti-pattern by using @Cacheable
 * without proper cache configuration (TTL, maximum size).
 */
@Service
public class UnboundedCachingService {
    
    private final UserRepository userRepository;
    
    public UnboundedCachingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * ANTI-PATTERN: Cacheable without TTL or size limits
     * Cache will grow indefinitely, causing memory issues
     */
    @Cacheable("users")  // ❌ ANTI-PATTERN: No TTL, no maximum size
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * ANTI-PATTERN: Cacheable without TTL or size limits
     */
    @Cacheable(value = "userById", key = "#id")  // ❌ ANTI-PATTERN: No TTL, no maximum size
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * ANTI-PATTERN: Cacheable without TTL or size limits
     */
    @Cacheable(value = "usersByRole", key = "#role")  // ❌ ANTI-PATTERN: No TTL, no maximum size
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * ANTI-PATTERN: Cacheable for expensive computation without limits
     */
    @Cacheable("expensiveComputation")  // ❌ ANTI-PATTERN: No TTL, no maximum size
    public String expensiveComputation(String input) {
        // Simulating expensive computation
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Result for: " + input;
    }
}

