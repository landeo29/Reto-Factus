package com.factus.factus_system.infrastructure.config;


import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Data;

@Data
@ConfigurationProperties(prefix = "factus.api")
public class FactusProperties {
    private String baseUrl;
    private String tokenUrl;
    private String username;
    private String password;
    private String clientId;
    private String clientSecret;
}