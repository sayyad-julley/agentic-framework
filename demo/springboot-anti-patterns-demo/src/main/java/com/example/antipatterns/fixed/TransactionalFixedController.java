package com.example.antipatterns.fixed;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FIXED: Transactional Overload on Read Operations
 * 
 * Solution: Always use @Transactional(readOnly = true) for read operations.
 * This allows the database to optimize for read-only access, use read locks,
 * and skip unnecessary transaction overhead.
 */
@RestController
@RequestMapping("/api/fixed/transactional")
public class TransactionalFixedController {
    
    private final UserRepository userRepository;
    
    public TransactionalFixedController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * FIXED: Read operation with readOnly = true
     * Database can optimize for read-only access
     */
    @GetMapping("/users")
    @Transactional(readOnly = true)  // ✅ FIXED: Using readOnly = true
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * FIXED: Read operation with readOnly = true
     */
    @GetMapping("/users/{id}")
    @Transactional(readOnly = true)  // ✅ FIXED: Using readOnly = true
    public User getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * FIXED: Read operation with readOnly = true
     */
    @GetMapping("/users/email/{email}")
    @Transactional(readOnly = true)  // ✅ FIXED: Using readOnly = true
    public User getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    /**
     * FIXED: Read operation with readOnly = true
     */
    @GetMapping("/users/role/{role}")
    @Transactional(readOnly = true)  // ✅ FIXED: Using readOnly = true
    public List<User> getUsersByRole(@PathVariable String role) {
        return userRepository.findByRole(role);
    }
}

