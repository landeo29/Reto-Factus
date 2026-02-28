package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.interfaces.IReceptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceptionServiceImpl implements IReceptionService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public Map<String, Object> uploadInvoice(Map<String, Object> data) {
        log.info("Cargando factura recibida...");

        return webClient.post()
                .uri("/v1/reception/invoices")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> listReceivedInvoices(Map<String, String> filters) {
        log.info("Listando facturas recibidas...");

        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v1/reception/invoices");
                    if (filters != null) {
                        filters.forEach(uriBuilder::queryParam);
                    }
                    return uriBuilder.build();
                })
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> emitEvent(Map<String, Object> data) {
        log.info("Emitiendo evento...");

        return webClient.post()
                .uri("/v1/reception/events")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}