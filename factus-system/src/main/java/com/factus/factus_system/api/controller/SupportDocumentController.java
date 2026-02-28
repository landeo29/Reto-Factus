package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.interfaces.ISupportDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/support-documents")
@RequiredArgsConstructor
public class SupportDocumentController {

    private final ISupportDocumentService supportDocumentService;

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> create(
            @RequestBody Map<String, Object> data) {

        Map<String, Object> result = supportDocumentService.createSupportDocument(data);
        return ResponseEntity.ok(ApiResponseDTO.ok("Documento soporte creado", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> list(
            @RequestParam(required = false) Map<String, String> filters) {

        Map<String, Object> result = supportDocumentService.listSupportDocuments(filters);
        return ResponseEntity.ok(ApiResponseDTO.ok("Documentos soporte listados", result));
    }

    @GetMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getByNumber(
            @PathVariable String number) {

        Map<String, Object> result = supportDocumentService.getSupportDocument(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Documento soporte encontrado", result));
    }

    @GetMapping("/{number}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String number) {

        byte[] pdf = supportDocumentService.downloadPdf(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=doc-soporte-" + number + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{number}/xml")
    public ResponseEntity<byte[]> downloadXml(@PathVariable String number) {

        byte[] xml = supportDocumentService.downloadXml(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=doc-soporte-" + number + ".xml")
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }

    @DeleteMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> delete(
            @PathVariable String number) {

        Map<String, Object> result = supportDocumentService.deleteSupportDocument(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Documento soporte eliminado", result));
    }
}