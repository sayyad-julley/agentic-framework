---
name: implementing-spring-boot-3.2
description: Implements production-ready Spring Boot 3.2.0 applications using Virtual Threads for high-concurrency I/O operations, RestClient migration from RestTemplate with timeouts and error handling, Micrometer/OpenTelemetry OTLP tracing, stateless REST security with JWT, and concurrent initialization. Avoids anti-patterns: transactional overload on reads, business logic in controllers, blocking I/O in reactive code, unbounded caching. Implements workarounds: DevTools remote deployment tuning, RestClient logging, tracing sampling. Use when migrating to Spring Boot 3.2.0, implementing high-throughput microservices with Java 21, replacing RestTemplate, or setting up distributed tracing.
version: 1.0.0
---

# Implementing Spring Boot 3.2.0

## Overview

Implements production-ready Spring Boot 3.2.0 applications leveraging Java 21 Virtual Threads for high-concurrency I/O-bound operations, modern RestClient for HTTP communication, Micrometer/OpenTelemetry for observability, and stateless security patterns. Spring Boot 3.2.0 establishes Java 21 as the baseline, enabling Virtual Threads that transform scalability from hundreds to 10,000+ concurrent requests without reactive programming complexity. This skill provides procedural knowledge for Virtual Thread executor configuration, RestClient migration with timeout and error handling, distributed tracing setup, stateless REST security, and concurrent initialization patterns while avoiding performance-killing anti-patterns.

## When to Use

Use this skill when:
- Migrating to Spring Boot 3.2.0 from earlier versions
- Implementing high-concurrency I/O-bound microservices requiring 10,000+ concurrent requests
- Replacing deprecated RestTemplate with modern RestClient
- Setting up distributed tracing with OpenTelemetry (OTLP)
- Configuring Virtual Thread executors for async operations
- Implementing stateless REST APIs with JWT authentication
- Optimizing application startup with concurrent data loading

**Input format**: Spring Boot 3.2.0+ project, Java 21+, application configuration files, microservices architecture context

**Expected output**: Production-ready Spring Boot 3.2.0 configuration following Virtual Thread patterns, RestClient implementation, observability setup, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Spring Boot 3.2.0+ project with Maven or Gradle build system
- Java 21+ runtime (required for Virtual Threads)
- Access to application configuration files (application.yml or application.properties)
- Understanding of I/O-bound vs CPU-bound workloads
- Network access to external services (monitoring systems, OAuth2 providers)

## Execution Steps

### Step 1: Virtual Thread Executor Pattern

Virtual Threads from Java 21 decouple I/O wait from carrier threads, enabling 10,000+ concurrent requests without reactive programming complexity.

**Pattern**: Replace fixed thread pools with Virtual Thread executor for I/O-bound operations
**Anti-pattern**: Using `Executors.newFixedThreadPool(10)` limiting concurrency to fixed thread count

**Virtual Thread Executor Configuration Template**:
```java
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class VirtualThreadConfig {
    @Bean(name = "virtualTaskExecutor")
    public Executor virtualTaskExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
```

**Usage**: `@Async("virtualTaskExecutor") public void process(Data d) {...}`

**Best Practices**:
- Use Virtual Threads for all I/O-bound async tasks (database queries, HTTP calls, file I/O)
- Replaces need for reactive programming (WebFlux) for I/O scaling
- Each task gets dedicated virtual thread, no pool size limits
- Suitable for I/O-bound workloads, not CPU-intensive operations

**Anti-Pattern Avoidance**:
- ❌ Fixed-size executors (`Executors.newFixedThreadPool(10)`) limiting concurrency
- ❌ Using platform threads for high-concurrency I/O operations
- ❌ Not leveraging Virtual Threads in Spring Boot 3.2.0

### Step 2: RestClient Migration

RestClient replaces deprecated RestTemplate, providing modern fluent API with built-in serialization and error handling.

**Pattern**: Migrate from RestTemplate to RestClient with timeout configuration and error mapping
**Anti-pattern**: Using deprecated RestTemplate, missing timeout configuration

**RestClient Configuration Template**:
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {
    @Bean
    public RestClient externalApiService(RestClient.Builder builder) {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 seconds
        factory.setReadTimeout(10000); // 10 seconds
        return builder
           .requestFactory(factory)
           .baseUrl("https://api.externalpartner.com/v1")
           .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
           .build();
    }
}
```

**Error Handling with onStatus Template**:
```java
public UserDto fetchUser(String userId) {
    return externalApiService.get()
       .uri("/users/{id}", userId)
       .retrieve()
       .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
            if (response.getStatusCode().equals(HttpStatus.NOT_FOUND)) {
                throw new UserNotFoundException("User ID not found: " + userId);
            }
            throw new ExternalApiAccessException("Client error: " + response.getStatusCode());
        })
       .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
            throw new ExternalSystemFailureException("Upstream server failed: " + response.getStatusCode());
        })
       .body(UserDto.class);
}
```

**Best Practices**:
- Always configure connection and read timeouts for production reliability
- Use `onStatus` for domain-specific error mapping (4xx → client exceptions, 5xx → server exceptions)
- Use `baseUrl` for consistent endpoint configuration
- RestClient is synchronous (blocking), use WebClient for reactive (non-blocking)

**Anti-Pattern Avoidance**:
- ❌ Using deprecated RestTemplate (maintenance mode)
- ❌ Missing timeout configuration (infinite waits)
- ❌ Generic error handling without status code mapping

### Step 3: Observability Configuration

Spring Boot 3.2.0 standardizes on Micrometer and OpenTelemetry (OTLP) for distributed tracing and metrics.

**Pattern**: Micrometer + OpenTelemetry (OTLP) for distributed tracing with development sampling
**Anti-pattern**: Basic monitoring only, missing distributed tracing

**Required Dependencies** (pom.xml):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**Observability Configuration Template**:
```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,prometheus
  tracing:
    sampling:
      probability: 1.0  # 100% sampling for development
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
```

**Best Practices**:
- Use OTLP exporter for standard trace data format (compatible with Jaeger, Zipkin, Tempo)
- Set `management.tracing.sampling.probability=1.0` for development (100% sampling)
- Micrometer automatically injects traceId and spanId into MDC for log correlation
- Export metrics to Prometheus for visualization and alerting

**Anti-Pattern Avoidance**:
- ❌ Basic monitoring only (missing distributed tracing)
- ❌ Low sampling probability in development (traces unreliable)
- ❌ Not using OTLP standard (vendor lock-in)

### Step 4: Stateless REST Security

Stateless authentication with JWT tokens requires explicit session management configuration.

**Pattern**: STATELESS session policy for JWT-based REST APIs
**Anti-pattern**: Default session management for stateless APIs

**Security Configuration Template**:
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
           .csrf(csrf -> csrf.disable())
           .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
           .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );
        // Custom JWT validation filters added via http.addFilterBefore(...)
        return http.build();
    }
}
```

**Best Practices**:
- Disable CSRF for stateless APIs using token authentication
- Enforce STATELESS session policy (no session creation or use)
- Define authorization rules per endpoint pattern
- Insert custom JWT validation filters before default security chain

**Anti-Pattern Avoidance**:
- ❌ Default session management for stateless APIs
- ❌ CSRF protection enabled for token-based authentication
- ❌ Missing authorization rules

### Step 5: Concurrent Data Initialization

Virtual Threads enable efficient parallel initialization of I/O-bound startup tasks.

**Pattern**: Virtual Thread executor for concurrent startup data loading
**Anti-pattern**: Sequential initialization blocking application startup

**Concurrent Initialization Template**:
```java
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class InitialDataLoader implements ApplicationRunner {
    private final List<Callable<Void>> dataLoaders;
    
    public InitialDataLoader(List<Callable<Void>> dataLoaders) {
        this.dataLoaders = dataLoaders;
    }
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
        try {
            List<Future<Void>> futures = executor.invokeAll(dataLoaders);
            for (Future<Void> future : futures) {
                future.get(); // Wait for completion, re-throw exceptions
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Data loading interrupted", e);
        } catch (ExecutionException e) {
            throw new RuntimeException("Data loader failed", e.getCause());
        } finally {
            executor.shutdown();
        }
    }
}
```

**Best Practices**:
- Use Virtual Thread executor for I/O-bound initialization tasks
- Wait for all tasks to complete before marking application ready
- Handle exceptions from individual loaders appropriately
- Shutdown executor after completion

**Anti-Pattern Avoidance**:
- ❌ Sequential initialization (slow startup)
- ❌ Not waiting for initialization completion
- ❌ Using fixed thread pools for initialization

## Transformation Rules

1. **Virtual Threads**: Always use `Executors.newVirtualThreadPerTaskExecutor()` for I/O-bound async operations. Replace all fixed thread pools with Virtual Thread executor.

2. **RestClient**: Migrate all RestTemplate usage to RestClient. Configure connection and read timeouts (10 seconds minimum). Use `onStatus` for domain-specific error mapping (4xx → client exceptions, 5xx → server exceptions).

3. **Observability**: Use OTLP exporter for distributed tracing. Set `management.tracing.sampling.probability=1.0` for development. Micrometer automatically injects traceId/spanId into MDC.

4. **Security**: Use `SessionCreationPolicy.STATELESS` for REST APIs with JWT authentication. Disable CSRF for token-based authentication.

5. **Initialization**: Use Virtual Thread executor for concurrent startup tasks. Wait for all tasks to complete before marking application ready.

## Anti-Patterns

1. **Transactional Overload on Read Operations**: Applying default `@Transactional` without `readOnly = true` to read-only queries. Forces database to acquire write locks and manage full ACID lifecycle, causing resource contention and reduced throughput. **Fix**: Always use `@Transactional(readOnly = true)` for read operations.

2. **Business Logic in Controllers**: Mixing core business validation, data manipulation, and domain rules directly within `@RestController` methods. Violates Single Responsibility Principle, makes code untestable and unreusable. **Fix**: Extract all business logic to dedicated `@Service` components.

3. **Blocking I/O in Reactive Code**: Executing blocking operations (JDBC, file I/O, synchronous HTTP) directly on Netty event loop threads in Spring WebFlux applications. Breaks non-blocking promise, stalls entire reactive pipeline. **Fix**: Offload blocking tasks to `Schedulers.boundedElastic()` using `Mono.fromCallable().subscribeOn()`.

4. **Unbounded Caching**: Using `@Cacheable` without TTL or maximum size limits. Caches grow indefinitely, leading to OutOfMemory errors and stale data. **Fix**: Configure Caffeine cache with `expireAfterWrite` and `maximumSize` limits.

5. **Fixed Thread Pools**: Using `Executors.newFixedThreadPool(10)` for async operations. Imposes fixed ceiling on concurrency, degrades when load exceeds thread count. **Fix**: Replace with Virtual Thread executor (`Executors.newVirtualThreadPerTaskExecutor()`).

6. **Deprecated RestTemplate**: Continuing to use RestTemplate which is in maintenance mode. **Fix**: Migrate to RestClient with timeout configuration and error handling.

7. **Default Transactional**: Not specifying `readOnly = true` for read operations. **Fix**: Always use `@Transactional(readOnly = true)` for queries.

## Best Practices

1. **Virtual Thread Executor**: Use `Executors.newVirtualThreadPerTaskExecutor()` for all I/O-bound async tasks. Enables 10,000+ concurrent requests without reactive programming complexity.

2. **RestClient Configuration**: Always configure connection and read timeouts (minimum 10 seconds). Use `onStatus` for domain-specific error mapping. Use `baseUrl` for consistent endpoint configuration.

3. **Observability Setup**: Use OTLP exporter for standard trace format. Set `management.tracing.sampling.probability=1.0` for development. Leverage automatic MDC injection for log correlation.

4. **Transactional readOnly**: Always use `@Transactional(readOnly = true)` for read operations. Allows database optimization, bypasses write locks, maximizes concurrent read throughput.

5. **Service Layer Separation**: Keep controllers thin, delegate all business logic to `@Service` components. Enables testability, reusability, and maintains architectural integrity.

6. **Caching Configuration**: Configure TTL (`expireAfterWrite`) and maximum size limits for all caches. Prevents memory exhaustion and data staleness.

7. **DevTools Tuning**: Configure `spring.devtools.restart.poll-interval` and `spring.devtools.restart.quiet-period` for remote deployment consistency in slower environments.

## Workarounds

1. **DevTools Remote Deployment**: In slower environments, file system watcher may split changes into batches, causing application inconsistency. **Workaround**: Increase `spring.devtools.restart.poll-interval` and `spring.devtools.restart.quiet-period` in application.properties to ensure complete change upload before restart.

```properties
# application.properties
spring.devtools.restart.poll-interval=2000
spring.devtools.restart.quiet-period=1000
```

2. **RestClient Request/Response Logging**: Standard Spring Boot logging doesn't capture RestClient request/response details. **Workaround**: Set `logging.level.org.apache.hc.client5.http=DEBUG` in application.properties to enable verbose HTTP client logging.

```properties
# application.properties
logging.level.org.apache.hc.client5.http=DEBUG
```

3. **Tracing Sampling Probability**: Default low sampling rate (10%) makes development debugging unreliable. **Workaround**: Override `management.tracing.sampling.probability=1.0` for development profile to ensure 100% trace capture.

```yaml
# application-dev.yml
management:
  tracing:
    sampling:
      probability: 1.0
```

## Examples

### Example 1: Virtual Thread Executor Configuration

**Scenario**: Configuring Virtual Thread executor for high-concurrency async operations.

**Minimal Implementation**:
```java
@Configuration
@EnableAsync
public class VirtualThreadConfig {
    @Bean(name = "virtualTaskExecutor")
    public Executor virtualTaskExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}

@Service
public class DataProcessingService {
    @Async("virtualTaskExecutor")
    public CompletableFuture<Void> processData(Data data) {
        // I/O-bound operation (database query, HTTP call)
        return CompletableFuture.completedFuture(null);
    }
}
```

**Expected Outcome**: Async operations execute on Virtual Threads, enabling 10,000+ concurrent I/O-bound tasks without thread pool limits.

### Example 2: RestClient with Error Handling

**Scenario**: Migrating from RestTemplate to RestClient with timeout configuration and error mapping.

**Minimal Implementation**:
```java
@Configuration
public class RestClientConfig {
    @Bean
    public RestClient apiClient(RestClient.Builder builder) {
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(10000);
        return builder
           .requestFactory(factory)
           .baseUrl("https://api.example.com/v1")
           .build();
    }
}

@Service
public class UserService {
    private final RestClient apiClient;
    
    public UserDto getUser(String id) {
        return apiClient.get()
           .uri("/users/{id}", id)
           .retrieve()
           .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                throw new UserNotFoundException("User not found: " + id);
            })
           .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                throw new ExternalSystemFailureException("Service unavailable");
            })
           .body(UserDto.class);
    }
}
```

**Expected Outcome**: RestClient configured with timeouts and domain-specific error handling, replacing deprecated RestTemplate.

## Error Handling

**RestClient Errors**: Use `onStatus` to map HTTP status codes to domain-specific exceptions. 4xx errors indicate client issues (validation, not found), 5xx errors indicate upstream failures (retry logic).

**Virtual Thread Errors**: Virtual Threads propagate exceptions normally. Use `CompletableFuture.exceptionally()` or `try-catch` for async error handling.

**Observability Errors**: Tracing failures don't affect application execution. Monitor trace export failures via Actuator endpoints.

**Initialization Errors**: Fail fast during startup if initialization tasks fail. Use `ExecutionException.getCause()` to extract original exception from failed `Callable`.

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, base URLs, or credentials in code
- ❌ No OAuth2 client secrets in application.yml
- ❌ No database passwords in version control
- ✅ Use environment variables for all sensitive configuration
- ✅ Use secure vaults (HashiCorp Vault, AWS Secrets Manager) for secrets
- ✅ RestClient baseUrl should use environment variables

**Configuration Example**:
```yaml
# application.yml
api:
  base-url: ${API_BASE_URL}
  timeout: ${API_TIMEOUT:10000}
```

**Operational Constraints**:
- Virtual Threads require Java 21+ runtime
- RestClient is synchronous (blocking), use WebClient for reactive
- OTLP tracing requires compatible collector (Jaeger, Zipkin, Tempo)
- DevTools workarounds only needed for remote deployment scenarios

## Dependencies

This skill provides guidance for Spring Boot 3.2.0 applications. Required dependencies:

**Core Spring Boot**:
- `spring-boot-starter-web`: Web application support
- `spring-boot-starter-actuator`: Actuator endpoints and observability

**RestClient**:
- `spring-boot-starter-web`: Includes RestClient (no additional dependency)

**Observability**:
- `io.micrometer:micrometer-tracing-bridge-otel`: Micrometer to OpenTelemetry bridge
- `io.opentelemetry:opentelemetry-exporter-otlp`: OTLP trace exporter
- `io.micrometer:micrometer-registry-prometheus`: Prometheus metrics export

**Security**:
- `spring-boot-starter-security`: Security framework

**Note**: Dependencies must be added to pom.xml (Maven) or build.gradle (Gradle). Virtual Threads require Java 21+ runtime (no additional dependency).

## Performance Considerations

**Virtual Threads**: Enable 10,000+ concurrent I/O-bound requests without reactive programming. Each virtual thread is lightweight (few KB), managed by Java runtime. Suitable for I/O-bound workloads, not CPU-intensive operations.

**RestClient**: Synchronous (blocking) client. Configure appropriate timeouts to prevent resource exhaustion. For high-throughput scenarios, consider WebClient (reactive) instead.

**Observability Overhead**: Micrometer metrics collection is asynchronous (ring buffers), minimal performance impact. Tracing adds minimal overhead (sampling reduces impact in production).

**Initialization**: Concurrent initialization with Virtual Threads reduces startup time for I/O-bound tasks. Ensure all initialization completes before accepting traffic.

## Related Resources

For extensive reference materials, see:
- Spring Boot 3.2.0 Documentation: https://spring.io/projects/spring-boot
- Java 21 Virtual Threads: https://openjdk.org/jeps/444
- RestClient Documentation: https://docs.spring.io/spring-framework/reference/integration/rest-clients.html
- Micrometer Documentation: https://micrometer.io/docs
- OpenTelemetry Documentation: https://opentelemetry.io/docs/
- Spring Security Documentation: https://docs.spring.io/spring-security/reference/

## Notes

- **Spring Boot 3.2.0**: Requires Java 17+ (Java 21+ for Virtual Threads). Full compatibility with Spring Framework 6.1 and Jakarta EE standards.
- **Virtual Threads**: Java 21 feature, enables 10,000+ concurrent I/O-bound requests without reactive programming complexity.
- **RestClient**: Replaces deprecated RestTemplate, provides modern fluent API with built-in serialization and error handling.
- **OTLP Tracing**: Standard protocol for distributed tracing, compatible with Jaeger, Zipkin, Tempo collectors.
- **DevTools Workarounds**: Only needed for remote deployment scenarios in slower environments.
- **Transactional readOnly**: Critical for database performance, always use for read operations.
- **Service Layer**: Controllers should be thin, all business logic in services for testability and reusability.

