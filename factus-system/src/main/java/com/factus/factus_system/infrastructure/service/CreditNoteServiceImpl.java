package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.interfaces.ICreditNoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditNoteServiceImpl implements ICreditNoteService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public Map<String, Object> createCreditNote(Map<String, Object> data) {
        log.info("Creando nota crédito...");

        return webClient.post()
                .uri("/v1/credit-notes/validate")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> listCreditNotes(Map<String, String> filters) {
        log.info("Listando notas crédito...");

        return webClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v1/credit-notes");
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
    public Map<String, Object> getCreditNote(String number) {
        log.info("Consultando nota crédito: {}", number);

        return webClient.get()
                .uri("/v1/credit-notes/show/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public byte[] downloadPdf(String number) {
        log.info("Descargando PDF nota crédito: {}", number);

        return webClient.get()
                .uri("/v1/credit-notes/download-pdf/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public byte[] downloadXml(String number) {
        log.info("Descargando XML nota crédito: {}", number);

        return webClient.get()
                .uri("/v1/credit-notes/download-xml/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(byte[].class)
                .block();
    }

    @Override
    public Map<String, Object> getEmailContent(String number) {
        log.info("Obteniendo contenido email nota crédito: {}", number);

        return webClient.get()
                .uri("/v1/credit-notes/email-content/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> sendEmail(String number) {
        log.info("Enviando email nota crédito: {}", number);

        return webClient.post()
                .uri("/v1/credit-notes/send-email/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> deleteCreditNote(String number) {
        log.info("Eliminando nota crédito: {}", number);

        return webClient.delete()
                .uri("/v1/credit-notes/{number}", number)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}