package com.hireflow.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Enables @Async methods securely bounding secondary thread pools to Spring Native execution contexts.
}
