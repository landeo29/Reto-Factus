package com.factus.factus_system.core.repository;


import com.factus.factus_system.core.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    Optional<Venta> findByNumeroVenta(String numeroVenta);
    Optional<Venta> findByNumeroFactura(String numeroFactura);
    List<Venta> findByEstado(String estado);
    List<Venta> findByClienteId(Long clienteId);
    List<Venta> findByCreadoEnBetween(LocalDateTime desde, LocalDateTime hasta);
}