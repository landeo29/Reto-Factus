package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Compra;
import com.factus.factus_system.core.entity.CompraDetalle;
import com.factus.factus_system.core.entity.Usuario;
import com.factus.factus_system.core.repository.CompraRepository;
import com.factus.factus_system.core.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProductoService productoService;
    private final UsuarioRepository usuarioRepository;

    public List<Compra> listarTodas() {
        return compraRepository.findAll();
    }

    public Compra buscarPorId(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));
    }

    public List<Compra> buscarPorEstado(String estado) {
        return compraRepository.findByEstado(estado);
    }

    public List<Compra> buscarPorProveedor(Long proveedorId) {
        return compraRepository.findByProveedorId(proveedorId);
    }

    public List<Compra> buscarPorFechas(LocalDateTime desde, LocalDateTime hasta) {
        return compraRepository.findByCreadoEnBetween(desde, hasta);
    }

    @Transactional
    public Compra crear(Compra compra) {
        // Asignar usuario desde JWT
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        compra.setUsuario(usuario);

        Long count = compraRepository.count() + 1;
        compra.setNumeroCompra("CMP-" + String.format("%06d", count));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalImpuestos = BigDecimal.ZERO;

        for (CompraDetalle detalle : compra.getDetalles()) {
            detalle.setCompra(compra);

            BigDecimal lineaSubtotal = detalle.getCostoUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));

            BigDecimal impuesto = lineaSubtotal
                    .multiply(detalle.getTasaImpuesto())
                    .divide(BigDecimal.valueOf(100));

            detalle.setSubtotal(lineaSubtotal);
            detalle.setMontoImpuesto(impuesto);
            detalle.setTotal(lineaSubtotal.add(impuesto));

            subtotal = subtotal.add(lineaSubtotal);
            totalImpuestos = totalImpuestos.add(impuesto);

            // Aumentar stock
            productoService.actualizarStock(detalle.getProducto().getId(), detalle.getCantidad());
        }

        compra.setSubtotal(subtotal);
        compra.setTotalImpuestos(totalImpuestos);
        compra.setTotal(subtotal.add(totalImpuestos));

        return compraRepository.save(compra);
    }

    @Transactional
    public Compra anular(Long id) {
        Compra compra = buscarPorId(id);
        compra.setEstado("ANULADA");

        for (CompraDetalle detalle : compra.getDetalles()) {
            productoService.actualizarStock(detalle.getProducto().getId(), -detalle.getCantidad());
        }

        return compraRepository.save(compra);
    }

    @Transactional
    public Compra marcarComoRecibida(Long id) {
        Compra compra = buscarPorId(id);
        compra.setEstado("RECIBIDA");
        return compraRepository.save(compra);
    }
}