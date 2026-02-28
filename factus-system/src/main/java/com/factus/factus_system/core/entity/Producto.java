package com.factus.factus_system.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal costo = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockMinimo = 0;

    @Column(length = 10)
    private String unidadMedidaId;

    @Column(length = 10)
    private String codigoEstandarId;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tasaImpuesto = BigDecimal.valueOf(19);

    @Column(length = 10)
    private String tributoId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean excluidoIva = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean esServicio = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

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
        if (stock == null) stock = 0;
        if (stockMinimo == null) stockMinimo = 0;
        if (costo == null) costo = java.math.BigDecimal.ZERO;
        if (tasaImpuesto == null) tasaImpuesto = java.math.BigDecimal.valueOf(19);
        if (excluidoIva == null) excluidoIva = false;
        if (esServicio == null) esServicio = false;
    }
}