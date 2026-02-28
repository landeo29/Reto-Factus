package com.factus.factus_system.core.repository;

import com.factus.factus_system.core.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByCodigo(String codigo);
    List<Producto> findByActivoTrue();
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    List<Producto> findByCategoriaId(Long categoriaId);
    List<Producto> findByStockLessThanEqual(Integer stockMinimo);
}