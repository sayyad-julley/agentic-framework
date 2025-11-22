package com.example.antipatterns.config;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initialize sample data for demo purposes
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    
    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User user1 = new User();
            user1.setName("John Doe");
            user1.setEmail("john.doe@company.com");
            user1.setRole("ADMIN");
            userRepository.save(user1);
            
            User user2 = new User();
            user2.setName("Jane Smith");
            user2.setEmail("jane.smith@example.com");
            user2.setRole("MANAGER");
            userRepository.save(user2);
            
            User user3 = new User();
            user3.setName("Bob Johnson");
            user3.setEmail("bob.johnson@example.com");
            user3.setRole("USER");
            userRepository.save(user3);
            
            User user4 = new User();
            user4.setName("Alice Brown");
            user4.setEmail("alice.brown@company.com");
            user4.setRole("ADMIN");
            userRepository.save(user4);
            
            User user5 = new User();
            user5.setName("Charlie Wilson");
            user5.setEmail("charlie.wilson@example.com");
            user5.setRole("USER");
            userRepository.save(user5);
        }
    }
}

