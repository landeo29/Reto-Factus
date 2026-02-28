package com.factus.factus_system.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(FactusProperties properties) {
        return WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Accept", "application/json")
                .build();
    }
}