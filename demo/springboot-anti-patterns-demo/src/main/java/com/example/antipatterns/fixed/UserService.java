package com.example.antipatterns.fixed;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

/**
 * FIXED: Business Logic Extracted to Service Layer
 * 
 * Solution: Extract all business logic to dedicated @Service components.
 * This follows Single Responsibility Principle, makes code testable and reusable.
 */
@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    // ✅ FIXED: Business validation logic in service
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    /**
     * FIXED: Business logic extracted to service
     */
    @Transactional
    public User createUser(User user) {
        // ✅ FIXED: Business validation in service
        validateEmail(user.getEmail());
        
        // ✅ FIXED: Business rule in service
        validateAdminEmailDomain(user);
        
        // ✅ FIXED: Business logic: Check duplicate
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        
        // ✅ FIXED: Business logic: Normalize email
        user.setEmail(user.getEmail().toLowerCase());
        
        // ✅ FIXED: Business logic: Set default role
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        return userRepository.save(user);
    }
    
    /**
     * FIXED: Business logic extracted to service
     */
    @Transactional
    public User promoteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // ✅ FIXED: Business rule in service
        if ("ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("User is already an admin");
        }
        
        // ✅ FIXED: Business logic: Promotion hierarchy
        String newRole = determinePromotedRole(user.getRole());
        user.setRole(newRole);
        
        return userRepository.save(user);
    }
    
    /**
     * FIXED: Business calculation in service
     */
    @Transactional(readOnly = true)
    public UserStats getUserStats() {
        List<User> allUsers = userRepository.findAll();
        
        // ✅ FIXED: Business calculation in service
        long adminCount = countUsersByRole(allUsers, "ADMIN");
        long managerCount = countUsersByRole(allUsers, "MANAGER");
        long userCount = countUsersByRole(allUsers, "USER");
        
        return new UserStats(adminCount, managerCount, userCount, allUsers.size());
    }
    
    // ✅ FIXED: Private helper methods for business logic
    private void validateEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }
    
    private void validateAdminEmailDomain(User user) {
        if ("ADMIN".equals(user.getRole()) && !user.getEmail().endsWith("@company.com")) {
            throw new IllegalArgumentException("Admin users must have @company.com email domain");
        }
    }
    
    private String determinePromotedRole(String currentRole) {
        return switch (currentRole) {
            case "USER" -> "MANAGER";
            case "MANAGER" -> "ADMIN";
            default -> throw new IllegalArgumentException("Cannot promote user with role: " + currentRole);
        };
    }
    
    private long countUsersByRole(List<User> users, String role) {
        return users.stream()
                .filter(u -> role.equals(u.getRole()))
                .count();
    }
    
    // ✅ FIXED: DTO class in service package (or separate dto package)
    public record UserStats(long adminCount, long managerCount, long userCount, long total) {}
}

