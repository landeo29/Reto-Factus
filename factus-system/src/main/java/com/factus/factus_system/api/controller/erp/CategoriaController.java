package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Categoria;
import com.factus.factus_system.infrastructure.service.erp.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/erp/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Categoria>>> listarTodos() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Categorías obtenidas", categoriaService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Categoria>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Categoría encontrada", categoriaService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Categoria>> crear(@RequestBody Categoria categoria) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Categoría creada", categoriaService.crear(categoria)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Categoria>> actualizar(@PathVariable Long id, @RequestBody Categoria categoria) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Categoría actualizada", categoriaService.actualizar(id, categoria)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.ok(ApiResponseDTO.ok("Categoría eliminada", null));
    }
}