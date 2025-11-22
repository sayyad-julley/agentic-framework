package com.example.antipatterns.fixed;

import com.example.antipatterns.entity.User;
import com.example.antipatterns.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * FIXED: Blocking I/O Offloaded from Reactive Threads
 * 
 * Solution: Offload blocking tasks to Schedulers.boundedElastic() using
 * Mono.fromCallable().subscribeOn(). This keeps the Netty event loop
 * threads free for non-blocking operations.
 */
@RestController
@RequestMapping("/api/fixed/blocking-io")
public class BlockingIOFixedController {
    
    private final UserRepository userRepository;
    
    public BlockingIOFixedController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * FIXED: Blocking JDBC call offloaded to bounded elastic scheduler
     */
    @GetMapping("/users")
    public Flux<User> getAllUsers() {
        // ✅ FIXED: Blocking operation offloaded to bounded elastic scheduler
        return Mono.fromCallable(() -> {
                    // Blocking JDBC call on separate thread
                    return userRepository.findAll();
                })
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(Flux::fromIterable);
    }
    
    /**
     * FIXED: Blocking JDBC call offloaded to bounded elastic scheduler
     */
    @GetMapping("/users/{id}")
    public Mono<User> getUserById(@PathVariable Long id) {
        // ✅ FIXED: Blocking operation offloaded to bounded elastic scheduler
        return Mono.fromCallable(() -> {
                    // Blocking JDBC call on separate thread
                    return userRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                })
                .subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * FIXED: Blocking file I/O offloaded to bounded elastic scheduler
     */
    @PostMapping("/users/export")
    public Mono<String> exportUsersToFile() {
        // ✅ FIXED: Blocking operations offloaded to bounded elastic scheduler
        return Mono.fromCallable(() -> {
                    // Blocking JDBC call
                    List<User> users = userRepository.findAll();
                    
                    // Blocking file I/O
                    File file = new File("users_export.txt");
                    try (FileWriter writer = new FileWriter(file)) {
                        for (User user : users) {
                            writer.write(user.toString() + "\n");
                        }
                    }
                    return "Exported " + users.size() + " users to file";
                })
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorMap(IOException.class, e -> new RuntimeException("Failed to export users", e));
    }
    
    /**
     * FIXED: Blocking file read offloaded to bounded elastic scheduler
     */
    @GetMapping("/users/import-status")
    public Mono<String> getImportStatus() {
        // ✅ FIXED: Blocking file read offloaded to bounded elastic scheduler
        return Mono.fromCallable(() -> {
                    String content = Files.readString(Paths.get("users_export.txt"));
                    return "File contains " + content.length() + " characters";
                })
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorReturn("File not found");
    }
    
    /**
     * FIXED: Blocking operations offloaded to bounded elastic scheduler
     */
    @GetMapping("/users/process")
    public Flux<String> processUsers() {
        // ✅ FIXED: Blocking JDBC call offloaded
        return Mono.fromCallable(() -> userRepository.findAll())
                .subscribeOn(Schedulers.boundedElastic())
                .flatMapMany(Flux::fromIterable)
                .flatMap(user -> {
                    // ✅ FIXED: Blocking operation in separate callable
                    return Mono.fromCallable(() -> {
                                // Simulating blocking operation on separate thread
                                Thread.sleep(100);
                                return "Processed: " + user.getName();
                            })
                            .subscribeOn(Schedulers.boundedElastic())
                            .onErrorReturn("Error processing: " + user.getName());
                });
    }
}

