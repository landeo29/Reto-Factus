package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.CuentaPorCobrar;
import com.factus.factus_system.infrastructure.service.erp.CuentaPorCobrarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/erp/cuentas-cobrar")
@RequiredArgsConstructor
public class CuentaPorCobrarController {

    private final CuentaPorCobrarService cuentaPorCobrarService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<CuentaPorCobrar>>> listarTodas() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuentas por cobrar obtenidas", cuentaPorCobrarService.listarTodas()));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponseDTO<List<CuentaPorCobrar>>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuentas obtenidas", cuentaPorCobrarService.listarPorEstado(estado)));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<ApiResponseDTO<List<CuentaPorCobrar>>> listarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuentas obtenidas", cuentaPorCobrarService.listarPorCliente(clienteId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<CuentaPorCobrar>> crear(@RequestBody CuentaPorCobrar cuenta) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cuenta creada", cuentaPorCobrarService.crear(cuenta)));
    }

    @PutMapping("/{id}/pago")
    public ResponseEntity<ApiResponseDTO<CuentaPorCobrar>> registrarPago(@PathVariable Long id, @RequestParam BigDecimal monto) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Pago registrado", cuentaPorCobrarService.registrarPago(id, monto)));
    }
}