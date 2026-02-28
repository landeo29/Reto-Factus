package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Cliente;
import com.factus.factus_system.core.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public List<Cliente> listarTodos() {
        return clienteRepository.findByActivoTrue();
    }

    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public Cliente buscarPorIdentificacion(String numero) {
        return clienteRepository.findByNumeroIdentificacion(numero)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + numero));
    }

    public List<Cliente> buscarPorNombre(String nombre) {
        return clienteRepository.findByNombresContainingIgnoreCase(nombre);
    }

    public Cliente crear(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Cliente actualizar(Long id, Cliente datos) {
        Cliente cliente = buscarPorId(id);
        cliente.setNombres(datos.getNombres());
        cliente.setDireccion(datos.getDireccion());
        cliente.setEmail(datos.getEmail());
        cliente.setTelefono(datos.getTelefono());
        cliente.setMunicipioId(datos.getMunicipioId());
        return clienteRepository.save(cliente);
    }

    public void eliminar(Long id) {
        Cliente cliente = buscarPorId(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }
}