package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.interfaces.ICatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogs")
@RequiredArgsConstructor
public class CatalogController {

    private final ICatalogService catalogService;

    @GetMapping("/numbering-ranges")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getNumeringRanges() {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Rangos obtenidos", catalogService.getNumeringRanges()));
    }

    @GetMapping("/numbering-ranges/{id}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getNumeringRange(
            @PathVariable int id) {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Rango obtenido", catalogService.getNumeringRange(id)));
    }

    @PostMapping("/numbering-ranges")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> createNumeringRange(
            @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Rango creado", catalogService.createNumeringRange(data)));
    }

    @DeleteMapping("/numbering-ranges/{id}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> deleteNumeringRange(
            @PathVariable int id) {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Rango eliminado", catalogService.deleteNumeringRange(id)));
    }

    @PutMapping("/numbering-ranges/{id}/consecutive")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> updateConsecutive(
            @PathVariable int id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Consecutivo actualizado", catalogService.updateConsecutive(id, data)));
    }

    @GetMapping("/municipalities")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getMunicipalities() {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Municipios obtenidos", catalogService.getMunicipalities()));
    }

    @GetMapping("/tributes")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getTributes() {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Tributos obtenidos", catalogService.getTributes()));
    }

    @GetMapping("/unit-measures")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getUnitMeasures() {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Unidades obtenidas", catalogService.getUnitMeasures()));
    }

    @GetMapping("/countries")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getCountries() {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Países obtenidos", catalogService.getCountries()));
    }

    @GetMapping("/reference-tables")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getReferenceTables() {
        return ResponseEntity.ok(
                ApiResponseDTO.ok("Tablas obtenidas", catalogService.getReferenceTables()));
    }

    @GetMapping("/taxes")
    public ResponseEntity<ApiResponseDTO<List<Map<String, Object>>>> getTaxes() {
        List<Map<String, Object>> result = catalogService.getTributes();
        return ResponseEntity.ok(ApiResponseDTO.ok("Tributos obtenidos", result));
    }
}