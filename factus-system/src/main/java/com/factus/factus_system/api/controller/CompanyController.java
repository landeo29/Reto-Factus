package com.factus.factus_system.api.controller;
import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.interfaces.ICompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyController {

    private final ICompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getCompany() {

        Map<String, Object> result = companyService.getCompany();
        return ResponseEntity.ok(ApiResponseDTO.ok("Datos de empresa", result));
    }

    @PutMapping
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> updateCompany(
            @RequestBody Map<String, Object> data) {

        Map<String, Object> result = companyService.updateCompany(data);
        return ResponseEntity.ok(ApiResponseDTO.ok("Empresa actualizada", result));
    }

    @PostMapping("/logo")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> updateLogo(
            @RequestBody byte[] logo) {

        Map<String, Object> result = companyService.updateLogo(logo);
        return ResponseEntity.ok(ApiResponseDTO.ok("Logo actualizado", result));
    }
}