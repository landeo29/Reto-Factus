package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.CuentaPorPagar;
import com.factus.factus_system.infrastructure.service.erp.CuentaPorPagarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/erp/cuentas-pagar")
@RequiredArgsConstructor
public class CuentaPorPagarController {

    private final CuentaPorPagarService cuentaPorPagarService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<CuentaPorPagar>>> listarTodas() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuentas por pagar obtenidas", cuentaPorPagarService.listarTodas()));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponseDTO<List<CuentaPorPagar>>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuentas obtenidas", cuentaPorPagarService.listarPorEstado(estado)));
    }

    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<ApiResponseDTO<List<CuentaPorPagar>>> listarPorProveedor(@PathVariable Long proveedorId) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuentas obtenidas", cuentaPorPagarService.listarPorProveedor(proveedorId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<CuentaPorPagar>> crear(@RequestBody CuentaPorPagar cuenta) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuenta creada", cuentaPorPagarService.crear(cuenta)));
    }

    @PutMapping("/{id}/pago")
    public ResponseEntity<ApiResponseDTO<CuentaPorPagar>> registrarPago(@PathVariable Long id, @RequestParam BigDecimal monto) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Pago registrado", cuentaPorPagarService.registrarPago(id, monto)));
    }
}