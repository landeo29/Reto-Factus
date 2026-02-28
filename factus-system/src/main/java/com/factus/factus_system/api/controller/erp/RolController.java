package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Rol;
import com.factus.factus_system.infrastructure.service.erp.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/erp/roles")
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Rol>>> listarTodos() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Roles obtenidos", rolService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Rol>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Rol encontrado", rolService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Rol>> crear(@RequestBody Rol rol) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Rol creado", rolService.crear(rol)));
    }
}