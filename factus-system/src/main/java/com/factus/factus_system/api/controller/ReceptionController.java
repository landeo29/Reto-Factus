package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.interfaces.IReceptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reception")
@RequiredArgsConstructor
public class ReceptionController {

    private final IReceptionService receptionService;

    @PostMapping("/invoices")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> uploadInvoice(
            @RequestBody Map<String, Object> data) {

        Map<String, Object> result = receptionService.uploadInvoice(data);
        return ResponseEntity.ok(ApiResponseDTO.ok("Factura cargada", result));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> listReceivedInvoices(
            @RequestParam(required = false) Map<String, String> filters) {

        Map<String, Object> result = receptionService.listReceivedInvoices(filters);
        return ResponseEntity.ok(ApiResponseDTO.ok("Facturas recibidas", result));
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> emitEvent(
            @RequestBody Map<String, Object> data) {

        Map<String, Object> result = receptionService.emitEvent(data);
        return ResponseEntity.ok(ApiResponseDTO.ok("Evento emitido", result));
    }
}