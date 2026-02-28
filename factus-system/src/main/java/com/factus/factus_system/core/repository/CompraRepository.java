package com.factus.factus_system.core.repository;

import com.factus.factus_system.core.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CompraRepository extends JpaRepository<Compra, Long> {
    Optional<Compra> findByNumeroCompra(String numeroCompra);
    List<Compra> findByEstado(String estado);
    List<Compra> findByProveedorId(Long proveedorId);
    List<Compra> findByCreadoEnBetween(LocalDateTime desde, LocalDateTime hasta);
}
