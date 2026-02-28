package com.factus.factus_system.core.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "compra_detalles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CompraDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_id", nullable = false)
    private Compra compra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal costoUnitario;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tasaImpuesto;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montoImpuesto;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal total;
}