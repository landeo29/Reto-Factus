package com.factus.factus_system.infrastructure.config;

import com.factus.factus_system.core.entity.Rol;
import com.factus.factus_system.core.entity.Usuario;
import com.factus.factus_system.core.repository.RolRepository;
import com.factus.factus_system.core.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        cargarRoles();
        cargarUsuarioAdmin();
    }

    private void cargarRoles() {
        if (rolRepository.count() == 0) {
            rolRepository.save(Rol.builder().nombre("ADMIN").descripcion("Administrador del sistema").build());
            rolRepository.save(Rol.builder().nombre("VENDEDOR").descripcion("Vendedor").build());
            rolRepository.save(Rol.builder().nombre("CONTADOR").descripcion("Contador").build());
            rolRepository.save(Rol.builder().nombre("ALMACENERO").descripcion("Encargado de almacén").build());
            log.info("Roles creados exitosamente");
        }
    }

    private void cargarUsuarioAdmin() {
        if (!usuarioRepository.existsByUsername("admin")) {
            Rol rolAdmin = rolRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));

            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombreCompleto("Administrador")
                    .email("admin@erp.com")
                    .telefono("3000000000")
                    .activo(true)
                    .rol(rolAdmin)
                    .build();

            usuarioRepository.save(admin);
            log.info("Usuario admin creado exitosamente");
        }
    }
}