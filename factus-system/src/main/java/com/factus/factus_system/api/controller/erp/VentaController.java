package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Venta;
import com.factus.factus_system.infrastructure.service.erp.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Venta>>> listarTodas() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Ventas obtenidas", ventaService.listarTodas()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Venta>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Venta encontrada", ventaService.buscarPorId(id)));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponseDTO<List<Venta>>> buscarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Ventas obtenidas", ventaService.buscarPorEstado(estado)));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<ApiResponseDTO<List<Venta>>> buscarPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Ventas obtenidas", ventaService.buscarPorCliente(clienteId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Venta>> crear(@RequestBody Venta venta) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Venta creada", ventaService.crear(venta)));
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<ApiResponseDTO<Venta>> anular(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Venta anulada", ventaService.anular(id)));
    }

    @PutMapping("/{id}/facturar")
    public ResponseEntity<ApiResponseDTO<Venta>> facturar(
            @PathVariable Long id,
            @RequestBody Map<String, String> datos) {

        Venta venta = ventaService.marcarComoFacturada(
                id,
                datos.get("numeroFactura"),
                datos.get("cufe"),
                datos.get("factusQrUrl")
        );
        return ResponseEntity.ok(ApiResponseDTO.ok("Venta facturada", venta));
    }

}