package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.interfaces.ICustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements ICustomerService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public Map<String, Object> getCustomerData(String identification) {
        log.info("Obteniendo datos del adquiriente: {}", identification);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/dian/acquirer")
                        .queryParam("identification_document_id", 3)
                        .queryParam("identification_number", identification)
                        .build())
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}