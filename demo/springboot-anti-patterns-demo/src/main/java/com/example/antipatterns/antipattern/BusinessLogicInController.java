package com.example.antipatterns.antipattern;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Pattern;

/**
 * ANTI-PATTERN: Business Logic in Controllers
 * 
 * Problem: Mixing core business validation, data manipulation, and domain rules
 * directly within @RestController methods. This violates Single Responsibility Principle,
 * makes code untestable and unreusable.
 * 
 * This controller demonstrates the anti-pattern by containing business logic
 * directly in controller methods.
 */
@RestController
@RequestMapping("/api/anti-pattern/business-logic")
public class BusinessLogicInController {
    
    private final UserRepository userRepository;
    
    public BusinessLogicInController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    // ❌ ANTI-PATTERN: Business validation logic in controller
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    /**
     * ANTI-PATTERN: Business logic mixed with HTTP handling
     * - Email validation
     * - Business rule: Admin users must have admin@company.com domain
     * - Data transformation
     */
    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        // ❌ ANTI-PATTERN: Business validation in controller
        if (user.getEmail() == null || !EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }
        
        // ❌ ANTI-PATTERN: Business rule in controller
        if ("ADMIN".equals(user.getRole()) && !user.getEmail().endsWith("@company.com")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "Admin users must have @company.com email domain"
            );
        }
        
        // ❌ ANTI-PATTERN: Data manipulation in controller
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, 
                "User with this email already exists"
            );
        }
        
        // ❌ ANTI-PATTERN: Business logic: Normalize email to lowercase
        user.setEmail(user.getEmail().toLowerCase());
        
        // ❌ ANTI-PATTERN: Business logic: Set default role
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        return userRepository.save(user);
    }
    
    /**
     * ANTI-PATTERN: Complex business logic in controller
     */
    @PutMapping("/users/{id}/promote")
    public User promoteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, 
                    "User not found"
                ));
        
        // ❌ ANTI-PATTERN: Business rule: Promotion logic in controller
        if ("ADMIN".equals(user.getRole())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "User is already an admin"
            );
        }
        
        // ❌ ANTI-PATTERN: Business logic: Promotion hierarchy
        String newRole = switch (user.getRole()) {
            case "USER" -> "MANAGER";
            case "MANAGER" -> "ADMIN";
            default -> throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "Cannot promote user with role: " + user.getRole()
            );
        };
        
        user.setRole(newRole);
        return userRepository.save(user);
    }
    
    /**
     * ANTI-PATTERN: Business calculation in controller
     */
    @GetMapping("/users/stats")
    public UserStats getUserStats() {
        List<User> allUsers = userRepository.findAll();
        
        // ❌ ANTI-PATTERN: Business calculation in controller
        long adminCount = allUsers.stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .count();
        
        long managerCount = allUsers.stream()
                .filter(u -> "MANAGER".equals(u.getRole()))
                .count();
        
        long userCount = allUsers.stream()
                .filter(u -> "USER".equals(u.getRole()))
                .count();
        
        return new UserStats(adminCount, managerCount, userCount, allUsers.size());
    }
    
    // ❌ ANTI-PATTERN: DTO class defined in controller
    public record UserStats(long adminCount, long managerCount, long userCount, long total) {}
}

