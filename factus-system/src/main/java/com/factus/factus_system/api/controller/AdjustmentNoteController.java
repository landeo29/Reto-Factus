package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.interfaces.IAdjustmentNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/adjustment-notes")
@RequiredArgsConstructor
public class AdjustmentNoteController {

    private final IAdjustmentNoteService adjustmentNoteService;

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> create(
            @RequestBody Map<String, Object> data) {

        Map<String, Object> result = adjustmentNoteService.createAdjustmentNote(data);
        return ResponseEntity.ok(ApiResponseDTO.ok("Nota de ajuste creada", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> list(
            @RequestParam(required = false) Map<String, String> filters) {

        Map<String, Object> result = adjustmentNoteService.listAdjustmentNotes(filters);
        return ResponseEntity.ok(ApiResponseDTO.ok("Notas de ajuste listadas", result));
    }

    @GetMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getByNumber(
            @PathVariable String number) {

        Map<String, Object> result = adjustmentNoteService.getAdjustmentNote(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Nota de ajuste encontrada", result));
    }

    @GetMapping("/{number}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String number) {

        byte[] pdf = adjustmentNoteService.downloadPdf(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=nota-ajuste-" + number + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/{number}/xml")
    public ResponseEntity<byte[]> downloadXml(@PathVariable String number) {

        byte[] xml = adjustmentNoteService.downloadXml(number);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=nota-ajuste-" + number + ".xml")
                .contentType(MediaType.APPLICATION_XML)
                .body(xml);
    }

    @DeleteMapping("/{number}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> delete(
            @PathVariable String number) {

        Map<String, Object> result = adjustmentNoteService.deleteAdjustmentNote(number);
        return ResponseEntity.ok(ApiResponseDTO.ok("Nota de ajuste eliminada", result));
    }
}