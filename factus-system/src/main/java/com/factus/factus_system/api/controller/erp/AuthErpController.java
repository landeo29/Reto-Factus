package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.Usuario;
import com.factus.factus_system.core.repository.UsuarioRepository;
import com.factus.factus_system.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/erp/auth")
@RequiredArgsConstructor
public class AuthErpController {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol().getNombre());

        Map<String, Object> response = Map.of(
                "token", token,
                "username", usuario.getUsername(),
                "nombreCompleto", usuario.getNombreCompleto(),
                "rol", usuario.getRol().getNombre()
        );

        return ResponseEntity.ok(ApiResponseDTO.ok("Login exitoso", response));
    }
}