package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.entity.TokenResponse;
import com.factus.factus_system.core.interfaces.IAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final IAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponseDTO<TokenResponse>> login() {
        TokenResponse token = authService.authenticate();
        return ResponseEntity.ok(ApiResponseDTO.ok("Autenticación exitosa", token));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponseDTO<TokenResponse>> refresh(
            @RequestParam String refreshToken) {
        TokenResponse token = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponseDTO.ok("Token refrescado", token));
    }
}