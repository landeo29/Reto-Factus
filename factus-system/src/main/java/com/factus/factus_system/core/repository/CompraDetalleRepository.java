package com.factus.factus_system.core.repository;

import com.factus.factus_system.core.entity.CompraDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompraDetalleRepository extends JpaRepository<CompraDetalle, Long> {
    List<CompraDetalle> findByCompraId(Long compraId);
}