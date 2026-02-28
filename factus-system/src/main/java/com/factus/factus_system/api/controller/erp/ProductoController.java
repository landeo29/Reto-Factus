package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Producto;
import com.factus.factus_system.infrastructure.service.erp.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/erp/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Producto>>> listarTodos() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Productos obtenidos", productoService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Producto>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Producto encontrado", productoService.buscarPorId(id)));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ApiResponseDTO<List<Producto>>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Productos encontrados", productoService.buscarPorNombre(nombre)));
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<ApiResponseDTO<List<Producto>>> buscarPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Productos obtenidos", productoService.buscarPorCategoria(categoriaId)));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<ApiResponseDTO<List<Producto>>> stockBajo() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Productos con stock bajo", productoService.productosStockBajo()));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Producto>> crear(@RequestBody Producto producto) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Producto creado", productoService.crear(producto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Producto>> actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Producto actualizado", productoService.actualizar(id, producto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.ok(ApiResponseDTO.ok("Producto eliminado", null));
    }
}