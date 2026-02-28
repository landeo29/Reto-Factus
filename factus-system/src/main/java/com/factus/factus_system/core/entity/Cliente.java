package com.factus.factus_system.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String tipoIdentificacion; // CC, NIT, CE

    @Column(nullable = false, unique = true, length = 20)
    private String numeroIdentificacion;

    @Column(length = 1)
    private String dv;

    @Column(nullable = false, length = 200)
    private String nombres;

    @Column(length = 200)
    private String direccion;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(length = 10)
    private String organizacionLegalId; // 1=Jurídica, 2=Natural

    @Column(length = 10)
    private String tributoId; // 01=IVA, 04=INC, ZA=No aplica

    @Column(length = 10)
    private String municipioId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @CreationTimestamp
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    private LocalDateTime actualizadoEn;

    @PrePersist
    public void prePersist() {
        if (activo == null) activo = true;
    }


}