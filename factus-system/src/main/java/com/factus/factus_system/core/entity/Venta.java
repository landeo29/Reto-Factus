package com.factus.factus_system.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ventas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String numeroVenta;

    @Column(length = 50)
    private String numeroFactura; // Número Factus (SETP...)

    @Column(length = 100)
    private String codigoReferencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 20)
    private String codigoMetodoPago; // 10=Efectivo, 47=Transferencia

    @Column(length = 20)
    private String medioPago;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalImpuestos = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal totalDescuentos = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE, FACTURADA, ANULADA

    @Column(length = 200)
    private String cufe;

    @Column(length = 500)
    private String factusQrUrl;

    @Column(length = 500)
    private String factusUrlPublica;

    @Column(length = 10)
    private String rangoNumeracionId;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VentaDetalle> detalles = new ArrayList<>();

    @Column(length = 500)
    private String notas;

    @CreationTimestamp
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    private LocalDateTime actualizadoEn;

    public void agregarDetalle(VentaDetalle detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }
}