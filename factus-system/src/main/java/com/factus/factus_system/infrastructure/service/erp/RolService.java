package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Rol;
import com.factus.factus_system.core.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RolService {

    private final RolRepository rolRepository;

    public List<Rol> listarTodos() {
        return rolRepository.findAll();
    }

    public Rol buscarPorId(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
    }

    public Rol buscarPorNombre(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + nombre));
    }

    public Rol crear(Rol rol) {
        return rolRepository.save(rol);
    }
}