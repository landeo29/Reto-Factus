package com.factus.factus_system.core.repository;

import com.factus.factus_system.core.entity.CuentaPorCobrar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CuentaPorCobrarRepository extends JpaRepository<CuentaPorCobrar, Long> {
    List<CuentaPorCobrar> findByEstado(String estado);
    List<CuentaPorCobrar> findByClienteId(Long clienteId);
}