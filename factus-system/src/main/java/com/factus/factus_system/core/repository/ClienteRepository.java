package com.factus.factus_system.core.repository;


import com.factus.factus_system.core.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNumeroIdentificacion(String numeroIdentificacion);
    List<Cliente> findByActivoTrue();
    List<Cliente> findByNombresContainingIgnoreCase(String nombres);
}