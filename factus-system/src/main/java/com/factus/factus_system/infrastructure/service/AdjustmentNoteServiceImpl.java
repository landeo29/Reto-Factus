package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.interfaces.IAdjustmentNoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdjustmentNoteServiceImpl implements IAdjustmentNoteService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public Map<String, Object> createAdjustmentNote(Map<String, Object> data) {
        log.info("Creando nota de ajuste...");

        return webClient.post()
                .uri("/v1/adjustment-notes/validate")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> listAdjustmentNotes(Map<String, String> filters) {
        log.info("Listando notas de ajuste...");

        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v1/adjustment-notes");
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
    public Map<String, Object> getAdjustmentNote(String number) {
        log.info("Consultando nota de ajuste: {}", number);

        return webClient.get()
                .uri("/v1/adjustment-notes/show/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public byte[] downloadPdf(String number) {
        log.info("Descargando PDF nota de ajuste: {}", number);

        return webClient.get()
                .uri("/v1/adjustment-notes/download-pdf/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public byte[] downloadXml(String number) {
        log.info("Descargando XML nota de ajuste: {}", number);

        return webClient.get()
                .uri("/v1/adjustment-notes/download-xml/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public Map<String, Object> deleteAdjustmentNote(String number) {
        log.info("Eliminando nota de ajuste: {}", number);

        return webClient.delete()
                .uri("/v1/adjustment-notes/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

}
