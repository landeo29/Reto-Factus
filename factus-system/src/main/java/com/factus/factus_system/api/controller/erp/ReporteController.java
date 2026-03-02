package com.factus.factus_system.api.controller.erp;

import com.factus.factus_system.core.dto.response.ApiResponseDTO;
import com.factus.factus_system.infrastructure.service.erp.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/erp/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> resumenGeneral() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Resumen obtenido", reporteService.resumenGeneral()));
    }

    @GetMapping("/ventas-periodo")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> ventasPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(ApiResponseDTO.ok("Ventas por período", reporteService.ventasPorPeriodo(desde, hasta)));
    }

    @GetMapping("/ventas-cliente")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> ventasPorCliente() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Ventas por cliente", reporteService.ventasPorCliente()));
    }

    @GetMapping("/productos-vendidos")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> productosVendidos() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Productos más vendidos", reporteService.productosVendidos()));
    }

    @GetMapping("/ventas-metodo-pago")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> ventasPorMetodoPago() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Ventas por método de pago", reporteService.ventasPorMetodoPago()));
    }

    @GetMapping("/compras-proveedor")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> comprasPorProveedor() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Compras por proveedor", reporteService.comprasPorProveedor()));
    }

    @GetMapping("/inventario")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> inventario() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Inventario", reporteService.inventario()));
    }

    @GetMapping("/rentabilidad")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> rentabilidad() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Rentabilidad", reporteService.rentabilidad()));
    }

    @GetMapping("/cartera")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> cartera() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Cartera", reporteService.cartera()));
    }

    @GetMapping("/tributario")
    public ResponseEntity<ApiResponseDTO<Map<String, Object>>> tributario() {
        return ResponseEntity.ok(ApiResponseDTO.ok("Tributario", reporteService.tributario()));
    }
}