package com.factus.factus_system.infrastructure.service;

import com.factus.factus_system.core.interfaces.ICatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogServiceImpl implements ICatalogService {

    private final WebClient webClient;
    private final AuthServiceImpl authService;

    @Override
    public List<Map<String, Object>> getNumeringRanges() {
        log.info("Obteniendo rangos de numeración...");
        return fetchCatalog("/v1/numbering-ranges");
    }

    @Override
    public Map<String, Object> getNumeringRange(int id) {
        log.info("Obteniendo rango: {}", id);

        return webClient.get()
                .uri("/v1/numbering-ranges/{id}", id)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> createNumeringRange(Map<String, Object> data) {
        log.info("Creando rango de numeración...");

        return webClient.post()
                .uri("/v1/numbering-ranges")
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> deleteNumeringRange(int id) {
        log.info("Eliminando rango: {}", id);

        return webClient.delete()
                .uri("/v1/numbering-ranges/{id}", id)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public Map<String, Object> updateConsecutive(int id, Map<String, Object> data) {
        log.info("Actualizando consecutivo rango: {}", id);

        return webClient.put()
                .uri("/v1/numbering-ranges/{id}/current", id)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .bodyValue(data)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @Override
    public List<Map<String, Object>> getMunicipalities() {
        log.info("Obteniendo municipios...");
        return fetchCatalog("/v1/municipalities");
    }

    @Override
    public List<Map<String, Object>> getTributes() {
        log.info("Obteniendo tributos...");
        return fetchCatalog("/v1/taxes");

    }

    @Override
    public List<Map<String, Object>> getUnitMeasures() {
        log.info("Obteniendo unidades de medida...");
        return fetchCatalog("/v1/measurement-units");
    }

    @Override
    public List<Map<String, Object>> getCountries() {
        log.info("Obteniendo países...");
        return fetchCatalog("/v1/countries");
    }

    @Override
    public List<Map<String, Object>> getReferenceTables() {
        log.info("Tablas de referencia son estáticas, no hay endpoint API");
        return List.of();
    }

    private List<Map<String, Object>> fetchCatalog(String uri) {
        Map<String, Object> response = webClient.get()
                .uri(uri)
                .header("Authorization", "Bearer " + authService.getAccessToken())
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) return List.of();

        Object data = response.get("data");
        if (data instanceof List) {
            return (List<Map<String, Object>>) data;
        }

        if (data instanceof Map) {
            Map<String, Object> dataMap = (Map<String, Object>) data;
            if (dataMap.containsKey("data")) {
                return (List<Map<String, Object>>) dataMap.get("data");
            }
        }

        if (response.containsKey("results")) {
            return (List<Map<String, Object>>) response.get("results");
        }

        return List.of();
    }
}