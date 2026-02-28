package com.factus.factus_system.core.entity;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "venta_detalles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VentaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal tasaDescuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tasaImpuesto;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montoImpuesto;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal total;
}