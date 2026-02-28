package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Proveedor;
import com.factus.factus_system.core.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public List<Proveedor> listarTodos() {
        return proveedorRepository.findByActivoTrue();
    }

    public Proveedor buscarPorId(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
    }

    public Proveedor buscarPorIdentificacion(String numero) {
        return proveedorRepository.findByNumeroIdentificacion(numero)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado: " + numero));
    }

    public List<Proveedor> buscarPorNombre(String nombre) {
        return proveedorRepository.findByNombresContainingIgnoreCase(nombre);
    }

    public Proveedor crear(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    public Proveedor actualizar(Long id, Proveedor datos) {
        Proveedor proveedor = buscarPorId(id);
        proveedor.setNombres(datos.getNombres());
        proveedor.setDireccion(datos.getDireccion());
        proveedor.setEmail(datos.getEmail());
        proveedor.setTelefono(datos.getTelefono());
        proveedor.setPersonaContacto(datos.getPersonaContacto());
        return proveedorRepository.save(proveedor);
    }

    public void eliminar(Long id) {
        Proveedor proveedor = buscarPorId(id);
        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }
}