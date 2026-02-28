package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.CuentaPorCobrar;
import com.factus.factus_system.core.repository.CuentaPorCobrarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CuentaPorCobrarService {

    private final CuentaPorCobrarRepository cuentaPorCobrarRepository;

    public List<CuentaPorCobrar> listarTodas() {
        return cuentaPorCobrarRepository.findAll();
    }

    public List<CuentaPorCobrar> listarPorEstado(String estado) {
        return cuentaPorCobrarRepository.findByEstado(estado);
    }

    public List<CuentaPorCobrar> listarPorCliente(Long clienteId) {
        return cuentaPorCobrarRepository.findByClienteId(clienteId);
    }

    public CuentaPorCobrar buscarPorId(Long id) {
        return cuentaPorCobrarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuenta por cobrar no encontrada"));
    }

    public CuentaPorCobrar crear(CuentaPorCobrar cuenta) {
        cuenta.setSaldo(cuenta.getMonto());
        return cuentaPorCobrarRepository.save(cuenta);
    }

    public CuentaPorCobrar registrarPago(Long id, BigDecimal montoPago) {
        CuentaPorCobrar cuenta = buscarPorId(id);
        BigDecimal nuevoPagado = cuenta.getMontoPagado().add(montoPago);
        BigDecimal nuevoSaldo = cuenta.getMonto().subtract(nuevoPagado);

        cuenta.setMontoPagado(nuevoPagado);
        cuenta.setSaldo(nuevoSaldo);

        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            cuenta.setEstado("PAGADA");
        } else {
            cuenta.setEstado("PARCIAL");
        }

        return cuentaPorCobrarRepository.save(cuenta);
    }
}