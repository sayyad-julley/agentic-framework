package com.example.antipatterns.fixed;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.concurrent.TimeUnit;

/**
 * FIXED: Bounded Caching Configuration
 * 
 * Solution: Configure Caffeine cache with expireAfterWrite and maximumSize limits.
 * This prevents memory issues and ensures stale data is evicted.
 */
@Configuration
@EnableCaching
public class BoundedCachingConfig {
    
    /**
     * FIXED: Cache manager with TTL and maximum size limits
     * Marked as @Primary to be used as the default CacheManager
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // ✅ FIXED: Configure cache with TTL and maximum size
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)  // ✅ FIXED: Maximum cache size
                .expireAfterWrite(10, TimeUnit.MINUTES)  // ✅ FIXED: TTL for cache entries
                .recordStats());  // Optional: Enable cache statistics
        
        return cacheManager;
    }
}

