package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Cliente;
import com.factus.factus_system.infrastructure.service.erp.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/erp/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<Cliente>>> listarTodos() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Clientes obtenidos", clienteService.listarTodos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Cliente>> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cliente encontrado", clienteService.buscarPorId(id)));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ApiResponseDTO<List<Cliente>>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Clientes encontrados", clienteService.buscarPorNombre(nombre)));
    }

    @GetMapping("/identificacion/{numero}")
    public ResponseEntity<ApiResponseDTO<Cliente>> buscarPorIdentificacion(@PathVariable String numero) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cliente encontrado", clienteService.buscarPorIdentificacion(numero)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<Cliente>> crear(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cliente creado", clienteService.crear(cliente)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Cliente>> actualizar(@PathVariable Long id, @RequestBody Cliente cliente) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cliente actualizado", clienteService.actualizar(id, cliente)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponseDTO<Void>> eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
        return ResponseEntity.ok(ApiResponseDTO.ok("Cliente eliminado", null));
    }
}