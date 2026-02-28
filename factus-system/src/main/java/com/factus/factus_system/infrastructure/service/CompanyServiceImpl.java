package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.interfaces.ICompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements ICompanyService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public Map<String, Object> getCompany() {
        log.info("Obteniendo datos de empresa...");

        return webClient.get()
                .uri("/v1/company")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> updateCompany(Map<String, Object> data) {
        log.info("Actualizando empresa...");

        return webClient.put()
                .uri("/v1/company")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> updateLogo(byte[] logo) {
        log.info("Actualizando logo empresa...");

        return webClient.post()
                .uri("/v1/company/logo")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(logo)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}