package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Proveedor;
import com.factus.factus_system.infrastructure.service.erp.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/erp/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Proveedor>>> listarTodos() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Proveedores obtenidos", proveedorService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Proveedor>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Proveedor encontrado", proveedorService.buscarPorId(id)));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ApiResponseDTO<List<Proveedor>>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Proveedores encontrados", proveedorService.buscarPorNombre(nombre)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Proveedor>> crear(@RequestBody Proveedor proveedor) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Proveedor creado", proveedorService.crear(proveedor)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Proveedor>> actualizar(@PathVariable Long id, @RequestBody Proveedor proveedor) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Proveedor actualizado", proveedorService.actualizar(id, proveedor)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.ok(ApiResponseDTO.ok("Proveedor eliminado", null));
    }
}