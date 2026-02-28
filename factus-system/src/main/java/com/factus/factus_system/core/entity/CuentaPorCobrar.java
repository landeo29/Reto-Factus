package com.factus.factus_system.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cuentas_por_cobrar")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CuentaPorCobrar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal montoPagado = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal saldo;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE, PARCIAL, PAGADA, VENCIDA

    @CreationTimestamp
    private LocalDateTime creadoEn;
}