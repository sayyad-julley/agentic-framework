package com.example.antipatterns.fixed;

import com.example.antipatterns.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * FIXED: Business Logic Extracted from Controller
 * 
 * Solution: Controller only handles HTTP concerns (request/response mapping, status codes).
 * All business logic is delegated to service layer.
 */
@RestController
@RequestMapping("/api/fixed/business-logic")
public class BusinessLogicFixedController {
    
    private final UserService userService;
    
    public BusinessLogicFixedController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * FIXED: Controller only handles HTTP concerns
     */
    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody User user) {
        try {
            // ✅ FIXED: Business logic delegated to service
            return userService.createUser(user);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * FIXED: Controller only handles HTTP concerns
     */
    @PutMapping("/users/{id}/promote")
    public User promoteUser(@PathVariable Long id) {
        try {
            // ✅ FIXED: Business logic delegated to service
            return userService.promoteUser(id);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * FIXED: Controller only handles HTTP concerns
     */
    @GetMapping("/users/stats")
    public UserService.UserStats getUserStats() {
        // ✅ FIXED: Business calculation delegated to service
        return userService.getUserStats();
    }
}

