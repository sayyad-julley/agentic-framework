# Spring Boot Anti-Patterns Demo

This project demonstrates common Spring Boot anti-patterns and their fixes. Each anti-pattern is implemented alongside its corrected version to help developers understand best practices.

## Anti-Patterns Covered

### 1. Transactional Overload on Read Operations

**Problem**: Applying default `@Transactional` without `readOnly = true` to read-only queries forces the database to acquire write locks and manage full ACID lifecycle, causing resource contention and reduced throughput.

**Location**: 
- Anti-pattern: `com.example.antipatterns.antipattern.TransactionalOverloadController`
- Fixed: `com.example.antipatterns.fixed.TransactionalFixedController`

**Fix**: Always use `@Transactional(readOnly = true)` for read operations.

**Example**:
```java
// ❌ ANTI-PATTERN
@GetMapping("/users")
@Transactional
public List<User> getAllUsers() {
    return userRepository.findAll();
}

// ✅ FIXED
@GetMapping("/users")
@Transactional(readOnly = true)
public List<User> getAllUsers() {
    return userRepository.findAll();
}
```

---

### 2. Business Logic in Controllers

**Problem**: Mixing core business validation, data manipulation, and domain rules directly within `@RestController` methods. This violates Single Responsibility Principle, makes code untestable and unreusable.

**Location**:
- Anti-pattern: `com.example.antipatterns.antipattern.BusinessLogicInController`
- Fixed: `com.example.antipatterns.fixed.BusinessLogicFixedController` and `UserService`

**Fix**: Extract all business logic to dedicated `@Service` components.

**Example**:
```java
// ❌ ANTI-PATTERN
@PostMapping("/users")
public User createUser(@RequestBody User user) {
    // Business validation in controller
    if (user.getEmail() == null || !EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email");
    }
    // Business rules in controller
    if ("ADMIN".equals(user.getRole()) && !user.getEmail().endsWith("@company.com")) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin must have @company.com");
    }
    return userRepository.save(user);
}

// ✅ FIXED
@PostMapping("/users")
public User createUser(@RequestBody User user) {
    return userService.createUser(user); // Business logic in service
}
```

---

### 3. Blocking I/O in Reactive Code

**Problem**: Executing blocking operations (JDBC, file I/O, synchronous HTTP) directly on Netty event loop threads in Spring WebFlux applications. This breaks non-blocking promise and stalls the entire reactive pipeline.

**Location**:
- Anti-pattern: `com.example.antipatterns.antipattern.BlockingIOInReactiveController`
- Fixed: `com.example.antipatterns.fixed.BlockingIOFixedController`

**Fix**: Offload blocking tasks to `Schedulers.boundedElastic()` using `Mono.fromCallable().subscribeOn()`.

**Example**:
```java
// ❌ ANTI-PATTERN
@GetMapping("/users")
public Flux<User> getAllUsers() {
    List<User> users = userRepository.findAll(); // Blocks event loop thread
    return Flux.fromIterable(users);
}

// ✅ FIXED
@GetMapping("/users")
public Flux<User> getAllUsers() {
    return Mono.fromCallable(() -> userRepository.findAll())
            .subscribeOn(Schedulers.boundedElastic())
            .flatMapMany(Flux::fromIterable);
}
```

---

### 4. Unbounded Caching

**Problem**: Using `@Cacheable` without TTL or maximum size limits. Caches grow indefinitely, leading to OutOfMemory errors and stale data.

**Location**:
- Anti-pattern: `com.example.antipatterns.antipattern.UnboundedCachingService`
- Fixed: `com.example.antipatterns.fixed.BoundedCachingService` and `BoundedCachingConfig`

**Fix**: Configure Caffeine cache with `expireAfterWrite` and `maximumSize` limits.

**Example**:
```java
// ❌ ANTI-PATTERN
@Cacheable("users") // No TTL, no maximum size
public List<User> getAllUsers() {
    return userRepository.findAll();
}

// ✅ FIXED - Configuration
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager();
    cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)  // Maximum cache size
            .expireAfterWrite(10, TimeUnit.MINUTES)  // TTL
            .recordStats());
    return cacheManager;
}

// ✅ FIXED - Usage
@Cacheable(value = "users") // Uses bounded cache from configuration
public List<User> getAllUsers() {
    return userRepository.findAll();
}
```

---

### 5. Fixed Thread Pools

**Problem**: Using `Executors.newFixedThreadPool(10)` for async operations. Imposes fixed ceiling on concurrency and degrades when load exceeds thread count.

**Location**:
- Anti-pattern: `com.example.antipatterns.antipattern.FixedThreadPoolService`
- Fixed: `com.example.antipatterns.fixed.VirtualThreadService` and `VirtualThreadConfig`

**Fix**: Replace with Virtual Thread executor (`Executors.newVirtualThreadPerTaskExecutor()`).

**Example**:
```java
// ❌ ANTI-PATTERN
private final Executor fixedThreadPool = Executors.newFixedThreadPool(10);

@Async("fixedThreadPoolExecutor")
public CompletableFuture<String> processTask(String taskId) {
    // Limited to 10 concurrent tasks
}

// ✅ FIXED
@Bean(name = "virtualThreadExecutor")
public Executor virtualThreadExecutor() {
    return Executors.newVirtualThreadPerTaskExecutor(); // Scales to millions
}

@Async("virtualThreadExecutor")
public CompletableFuture<String> processTask(String taskId) {
    // Can handle millions of concurrent tasks
}
```

---

### 6. Deprecated RestTemplate

**Problem**: Continuing to use `RestTemplate` which is in maintenance mode. Spring recommends migrating to `RestClient`.

**Location**:
- Anti-pattern: `com.example.antipatterns.antipattern.RestTemplateService`
- Fixed: `com.example.antipatterns.fixed.RestClientService`

**Fix**: Migrate to `RestClient` with timeout configuration and error handling.

**Example**:
```java
// ❌ ANTI-PATTERN
private final RestTemplate restTemplate = new RestTemplate();

public String fetchData(String url) {
    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
    return response.getBody();
}

// ✅ FIXED
private final RestClient restClient = RestClient.builder()
        .baseUrl("https://api.example.com")
        .requestFactory(request -> {
            // Configure timeout
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
            factory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());
            return factory.createRequest(request.getURI(), request.getMethod());
        })
        .defaultStatusHandler(HttpStatusCode::is4xxClientError, (request, response) -> {
            throw new RuntimeException("Client error: " + response.getStatusCode());
        })
        .build();

public String fetchData(String url) {
    return restClient.get()
            .uri(url)
            .retrieve()
            .body(String.class);
}
```

---

## Running the Demo

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Build and Run
```bash
cd springboot-anti-patterns-demo
mvn clean install
mvn spring-boot:run
```

### Test Endpoints

#### Anti-Pattern Endpoints
- `GET /api/anti-pattern/transactional-overload/users` - Transactional overload
- `GET /api/anti-pattern/business-logic/users` - Business logic in controller
- `GET /api/anti-pattern/blocking-io/users` - Blocking I/O in reactive code

#### Fixed Endpoints
- `GET /api/fixed/transactional/users` - Fixed transactional
- `GET /api/fixed/business-logic/users` - Fixed business logic
- `GET /api/fixed/blocking-io/users` - Fixed blocking I/O

#### Demo Info
- `GET /api/demo/anti-patterns` - List all anti-pattern endpoints
- `GET /api/demo/fixed` - List all fixed pattern endpoints

### Actuator Endpoints
- `GET /actuator/health` - Health check
- `GET /actuator/caches` - View cache information

---

## Project Structure

```
springboot-anti-patterns-demo/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/antipatterns/
│   │   │       ├── antipattern/          # Anti-pattern implementations
│   │   │       ├── fixed/                # Fixed implementations
│   │   │       ├── controller/           # Demo controllers
│   │   │       ├── entity/               # JPA entities
│   │   │       ├── repository/          # JPA repositories
│   │   │       └── config/              # Configuration classes
│   │   └── resources/
│   │       └── application.yml           # Application configuration
│   └── test/                             # Test classes
└── pom.xml                               # Maven dependencies
```

---

## Key Takeaways

1. **Always use `@Transactional(readOnly = true)` for read operations** to optimize database performance
2. **Keep controllers thin** - delegate business logic to service layer
3. **Never block reactive threads** - offload blocking operations to bounded elastic scheduler
4. **Configure cache limits** - always set TTL and maximum size for caches
5. **Use virtual threads** for high-concurrency scenarios instead of fixed thread pools
6. **Migrate from RestTemplate to RestClient** for modern HTTP client features

---

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Framework Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Project Loom Virtual Threads](https://openjdk.org/projects/loom/)
- [Spring RestClient Documentation](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html)

---

## License

This project is for educational purposes only.

