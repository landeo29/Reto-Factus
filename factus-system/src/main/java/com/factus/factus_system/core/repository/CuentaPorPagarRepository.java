package com.factus.factus_system.core.repository;

import com.factus.factus_system.core.entity.CuentaPorPagar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CuentaPorPagarRepository extends JpaRepository<CuentaPorPagar, Long> {
    List<CuentaPorPagar> findByEstado(String estado);
    List<CuentaPorPagar> findByProveedorId(Long proveedorId);
}