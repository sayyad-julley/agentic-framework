package com.example.antipatterns.antipattern;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

/**
 * ANTI-PATTERN: Blocking I/O in Reactive Code
 * 
 * Problem: Executing blocking operations (JDBC, file I/O, synchronous HTTP)
 * directly on Netty event loop threads in Spring WebFlux applications.
 * This breaks non-blocking promise, stalls entire reactive pipeline.
 * 
 * This controller demonstrates the anti-pattern by performing blocking
 * operations directly in reactive methods.
 */
@RestController
@RequestMapping("/api/anti-pattern/blocking-io")
public class BlockingIOInReactiveController {
    
    private final UserRepository userRepository;
    
    public BlockingIOInReactiveController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * ANTI-PATTERN: Blocking JDBC call on reactive thread
     * This blocks the Netty event loop thread
     */
    @GetMapping("/users")
    public Flux<User> getAllUsers() {
        // ❌ ANTI-PATTERN: Blocking JDBC call on reactive thread
        List<User> users = userRepository.findAll();
        return Flux.fromIterable(users);
    }
    
    /**
     * ANTI-PATTERN: Blocking JDBC call on reactive thread
     */
    @GetMapping("/users/{id}")
    public Mono<User> getUserById(@PathVariable Long id) {
        // ❌ ANTI-PATTERN: Blocking JDBC call on reactive thread
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return Mono.just(user);
    }
    
    /**
     * ANTI-PATTERN: Blocking file I/O on reactive thread
     */
    @PostMapping("/users/export")
    public Mono<String> exportUsersToFile() {
        // ❌ ANTI-PATTERN: Blocking file I/O on reactive thread
        List<User> users = userRepository.findAll();
        
        try {
            File file = new File("users_export.txt");
            try (FileWriter writer = new FileWriter(file)) {
                for (User user : users) {
                    writer.write(user.toString() + "\n");
                }
            }
            return Mono.just("Exported " + users.size() + " users to file");
        } catch (IOException e) {
            return Mono.error(new RuntimeException("Failed to export users", e));
        }
    }
    
    /**
     * ANTI-PATTERN: Blocking file read on reactive thread
     */
    @GetMapping("/users/import-status")
    public Mono<String> getImportStatus() {
        // ❌ ANTI-PATTERN: Blocking file read on reactive thread
        try {
            String content = Files.readString(Paths.get("users_export.txt"));
            return Mono.just("File contains " + content.length() + " characters");
        } catch (IOException e) {
            return Mono.just("File not found");
        }
    }
    
    /**
     * ANTI-PATTERN: Multiple blocking operations on reactive thread
     */
    @GetMapping("/users/process")
    public Flux<String> processUsers() {
        // ❌ ANTI-PATTERN: Blocking JDBC call
        List<User> users = userRepository.findAll();
        
        return Flux.fromIterable(users)
                .map(user -> {
                    // ❌ ANTI-PATTERN: Blocking operation in map (synchronous processing)
                    try {
                        Thread.sleep(100); // Simulating blocking operation
                        return "Processed: " + user.getName();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return "Error processing: " + user.getName();
                    }
                });
    }
}

