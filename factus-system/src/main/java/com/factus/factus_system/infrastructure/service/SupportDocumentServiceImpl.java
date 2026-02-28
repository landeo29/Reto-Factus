package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.interfaces.ISupportDocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportDocumentServiceImpl implements ISupportDocumentService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public Map<String, Object> createSupportDocument(Map<String, Object> data) {
        log.info("Creando documento soporte...");

        return webClient.post()
                .uri("/v1/support-documents/validate")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> listSupportDocuments(Map<String, String> filters) {
        log.info("Listando documentos soporte...");

        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v1/support-documents");
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
    public Map<String, Object> getSupportDocument(String number) {
        log.info("Consultando documento soporte: {}", number);

        return webClient.get()
                .uri("/v1/support-documents/show/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public byte[] downloadPdf(String number) {
        log.info("Descargando PDF documento soporte: {}", number);

        return webClient.get()
                .uri("/v1/support-documents/download-pdf/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public byte[] downloadXml(String number) {
        log.info("Descargando XML documento soporte: {}", number);

        return webClient.get()
                .uri("/v1/support-documents/download-xml/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public Map<String, Object> deleteSupportDocument(String number) {
        log.info("Eliminando documento soporte: {}", number);

        return webClient.delete()
                .uri("/v1/support-documents/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}