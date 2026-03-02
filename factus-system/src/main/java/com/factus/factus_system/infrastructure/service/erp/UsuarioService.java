package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Usuario;
import com.factus.factus_system.core.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public Usuario buscarPorUsername(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    }

    public Usuario crear(Usuario usuario) {
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new RuntimeException("Username ya existe: " + usuario.getUsername());
        }
        if (usuario.getEmail() != null && !usuario.getEmail().isEmpty()
                && usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Email ya existe: " + usuario.getEmail());
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario datos) {
        Usuario usuario = buscarPorId(id);
        usuario.setNombreCompleto(datos.getNombreCompleto());
        usuario.setEmail(datos.getEmail());
        usuario.setTelefono(datos.getTelefono());
        usuario.setActivo(datos.getActivo());
        usuario.setRol(datos.getRol());

        if (datos.getPassword() != null && !datos.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(datos.getPassword()));
        }

        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        Usuario usuario = buscarPorId(id);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }
}