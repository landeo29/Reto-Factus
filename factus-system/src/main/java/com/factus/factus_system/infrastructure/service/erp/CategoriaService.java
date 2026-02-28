package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Categoria;
import com.factus.factus_system.core.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<Categoria> listarTodos() {
        return categoriaRepository.findByActivoTrue();
    }

    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    public Categoria crear(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public Categoria actualizar(Long id, Categoria datos) {
        Categoria categoria = buscarPorId(id);
        categoria.setNombre(datos.getNombre());
        categoria.setDescripcion(datos.getDescripcion());
        return categoriaRepository.save(categoria);
    }

    public void eliminar(Long id) {
        Categoria categoria = buscarPorId(id);
        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }
}