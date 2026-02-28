package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Usuario;
import com.factus.factus_system.infrastructure.service.erp.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/erp/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Usuario>>> listarTodos() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Usuarios obtenidos", usuarioService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Usuario>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Usuario encontrado", usuarioService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Usuario>> crear(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Usuario creado", usuarioService.crear(usuario)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Usuario>> actualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Usuario actualizado", usuarioService.actualizar(id, usuario)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.ok(ApiResponseDTO.ok("Usuario eliminado", null));
    }
}