package com.factus.factus_system.core.repository;


import com.factus.factus_system.core.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    Optional<Proveedor> findByNumeroIdentificacion(String numeroIdentificacion);
    List<Proveedor> findByActivoTrue();
    List<Proveedor> findByNombresContainingIgnoreCase(String nombres);
}