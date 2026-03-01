package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Compra;
import com.factus.factus_system.infrastructure.service.erp.CompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/erp/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Compra>>> listarTodas() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Compras obtenidas", compraService.listarTodas()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Compra>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Compra encontrada", compraService.buscarPorId(id)));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponseDTO<List<Compra>>> buscarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Compras obtenidas", compraService.buscarPorEstado(estado)));
    }

    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<ApiResponseDTO<List<Compra>>> buscarPorProveedor(@PathVariable Long proveedorId) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Compras obtenidas", compraService.buscarPorProveedor(proveedorId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Compra>> crear(@RequestBody Compra compra) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Compra creada", compraService.crear(compra)));
    }

    @PutMapping("/{id}/anular")
    public ResponseEntity<ApiResponseDTO<Compra>> anular(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Compra anulada", compraService.anular(id)));
    }

    @PutMapping("/{id}/recibir")
    public ResponseEntity<ApiResponseDTO<Compra>> recibir(@PathVariable Long id) {
        Compra compra = compraService.marcarComoRecibida(id);
        return ResponseEntity.ok(ApiResponseDTO.ok("Compra recibida", compra));
    }
}