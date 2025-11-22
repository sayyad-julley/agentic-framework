package com.example.antipatterns;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableCaching
@EnableTransactionManagement
public class SpringBootAntiPatternsDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootAntiPatternsDemoApplication.class, args);
    }
}

