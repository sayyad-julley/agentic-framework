package com.example.antipatterns.fixed;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * FIXED: Bounded Caching
 * 
 * Solution: Using @Cacheable with properly configured cache manager
 * that has TTL and maximum size limits (configured in BoundedCachingConfig).
 */
@Service
public class BoundedCachingService {
    
    private final UserRepository userRepository;
    
    public BoundedCachingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * FIXED: Cacheable with bounded cache configuration
     * Cache has maximum size and TTL configured in BoundedCachingConfig
     */
    @Cacheable(value = "users")  // ✅ FIXED: Uses bounded cache from configuration
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * FIXED: Cacheable with bounded cache configuration
     */
    @Cacheable(value = "userById", key = "#id")  // ✅ FIXED: Uses bounded cache from configuration
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * FIXED: Cacheable with bounded cache configuration
     */
    @Cacheable(value = "usersByRole", key = "#role")  // ✅ FIXED: Uses bounded cache from configuration
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * FIXED: Cacheable for expensive computation with bounded cache
     */
    @Cacheable(value = "expensiveComputation")  // ✅ FIXED: Uses bounded cache from configuration
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

