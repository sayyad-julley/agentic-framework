package com.example.antipatterns.antipattern;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ANTI-PATTERN: Transactional Overload on Read Operations
 * 
 * Problem: Using @Transactional without readOnly = true for read-only queries.
 * This forces the database to acquire write locks and manage full ACID lifecycle,
 * causing resource contention and reduced throughput.
 * 
 * This controller demonstrates the anti-pattern by applying @Transactional
 * without readOnly = true to read operations.
 */
@RestController
@RequestMapping("/api/anti-pattern/transactional-overload")
public class TransactionalOverloadController {
    
    private final UserRepository userRepository;
    
    public TransactionalOverloadController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * ANTI-PATTERN: Read operation with default @Transactional
     * Forces database to acquire write locks unnecessarily
     */
    @GetMapping("/users")
    @Transactional  // ❌ ANTI-PATTERN: Missing readOnly = true
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * ANTI-PATTERN: Read operation with default @Transactional
     */
    @GetMapping("/users/{id}")
    @Transactional  // ❌ ANTI-PATTERN: Missing readOnly = true
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * ANTI-PATTERN: Read operation with default @Transactional
     */
    @GetMapping("/users/email/{email}")
    @Transactional  // ❌ ANTI-PATTERN: Missing readOnly = true
    public User getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * ANTI-PATTERN: Read operation with default @Transactional
     */
    @GetMapping("/users/role/{role}")
    @Transactional  // ❌ ANTI-PATTERN: Missing readOnly = true
    public List<User> getUsersByRole(@PathVariable String role) {
        return userRepository.findByRole(role);
    }
}

