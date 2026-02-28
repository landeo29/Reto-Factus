package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.CuentaPorPagar;
import com.factus.factus_system.core.repository.CuentaPorPagarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CuentaPorPagarService {

    private final CuentaPorPagarRepository cuentaPorPagarRepository;

    public List<CuentaPorPagar> listarTodas() {
        return cuentaPorPagarRepository.findAll();
    }

    public List<CuentaPorPagar> listarPorEstado(String estado) {
        return cuentaPorPagarRepository.findByEstado(estado);
    }

    public List<CuentaPorPagar> listarPorProveedor(Long proveedorId) {
        return cuentaPorPagarRepository.findByProveedorId(proveedorId);
    }

    public CuentaPorPagar buscarPorId(Long id) {
        return cuentaPorPagarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuenta por pagar no encontrada"));
    }

    public CuentaPorPagar crear(CuentaPorPagar cuenta) {
        cuenta.setSaldo(cuenta.getMonto());
        return cuentaPorPagarRepository.save(cuenta);
    }

    public CuentaPorPagar registrarPago(Long id, BigDecimal montoPago) {
        CuentaPorPagar cuenta = buscarPorId(id);
        BigDecimal nuevoPagado = cuenta.getMontoPagado().add(montoPago);
        BigDecimal nuevoSaldo = cuenta.getMonto().subtract(nuevoPagado);

        cuenta.setMontoPagado(nuevoPagado);
        cuenta.setSaldo(nuevoSaldo);

        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            cuenta.setEstado("PAGADA");
        } else {
            cuenta.setEstado("PARCIAL");
        }

        return cuentaPorPagarRepository.save(cuenta);
    }
}