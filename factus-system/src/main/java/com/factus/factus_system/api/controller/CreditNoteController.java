package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.interfaces.ICreditNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/credit-notes")
@RequiredArgsConstructor
public class CreditNoteController {

    private final ICreditNoteService creditNoteService;

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> create(
            @RequestBody Map<String, Object> data) {

        Map<String, Object> result = creditNoteService.createCreditNote(data);
        return ResponseEntity.ok(ApiResponseDTO.ok("Nota crédito creada", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> list(
            @RequestParam(required = false) Map<String, String> filters) {

        Map<String, Object> result = creditNoteService.listCreditNotes(filters);
        return ResponseEntity.ok(ApiResponseDTO.ok("Notas crédito listadas", result));
    }

    @GetMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getByNumber(
            @PathVariable String number) {

        Map<String, Object> result = creditNoteService.getCreditNote(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Nota crédito encontrada", result));
    }

    @GetMapping("/{number}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String number) {

        byte[] pdf = creditNoteService.downloadPdf(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=nota-credito-" + number + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{number}/xml")
    public ResponseEntity<byte[]> downloadXml(@PathVariable String number) {

        byte[] xml = creditNoteService.downloadXml(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=nota-credito-" + number + ".xml")
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }

    @GetMapping("/{number}/email-content")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getEmailContent(
            @PathVariable String number) {

        Map<String, Object> result = creditNoteService.getEmailContent(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Contenido email obtenido", result));
    }

    @PostMapping("/{number}/send-email")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> sendEmail(
            @PathVariable String number) {

        Map<String, Object> result = creditNoteService.sendEmail(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Email enviado", result));
    }

    @DeleteMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> delete(
            @PathVariable String number) {

        Map<String, Object> result = creditNoteService.deleteCreditNote(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Nota crédito eliminada", result));
    }
}