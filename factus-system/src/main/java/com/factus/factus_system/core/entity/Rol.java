package com.factus.factus_system.core.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre; // ADMIN, VENDEDOR, CONTADOR, ALMACENERO

    @Column(length = 200)
    private String descripcion;
}