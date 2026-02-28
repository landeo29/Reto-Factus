package com.factus.factus_system.api.controller;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.core.interfaces.ICustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final ICustomerService customerService;

    @GetMapping("/{identification}")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> getCustomer(
            @PathVariable String identification) {

        Map<String, Object> result = customerService.getCustomerData(identification);
        return ResponseEntity.ok(ApiResponseDTO.ok("Datos del cliente", result));
    }
}