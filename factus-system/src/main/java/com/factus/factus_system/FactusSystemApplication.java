package com.factus.factus_system;

import com.factus.factus_system.infrastructure.config.FactusProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(FactusProperties.class)
public class FactusSystemApplication {
	public static void main(String[] args) {
		SpringApplication.run(FactusSystemApplication.class, args);
	}
}