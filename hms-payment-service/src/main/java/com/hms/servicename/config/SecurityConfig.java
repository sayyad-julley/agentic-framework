package com.hms.servicename.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * @Order(1) - Stateless Resource Server for APIs
     * This chain is ALWAYS ON. It protects all internal /api/ routes.
     * It demands a valid JWT Bearer token and is STATELESS. [cite: 1028, 1032, 1194]
     */
    @Bean
    @Order(1)
    public SecurityFilterChain resourceServerSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            // Apply this filter chain to API routes
            .securityMatcher("/api/**") 
            .authorizeHttpRequests(authz -> authz
                // Webhooks must be public but secured separately
                .requestMatchers("/api/webhooks/**").permitAll() 
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(csrf -> csrf.disable()); // Disable CSRF for stateless APIs
        return http.build();
    }

    /**
     * @Order(2) - Stateful OIDC Client for User Login
     * This chain is ONLY for the 'saas-backend-for-frontend' pattern.
     * It handles the user-facing login flow and is STATEFUL. [cite: 974, 1191]
     */
    
}

