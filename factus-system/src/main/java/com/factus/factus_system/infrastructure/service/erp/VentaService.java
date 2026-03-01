package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Usuario;
import com.factus.factus_system.core.entity.Venta;
import com.factus.factus_system.core.entity.VentaDetalle;
import com.factus.factus_system.core.repository.UsuarioRepository;
import com.factus.factus_system.core.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoService productoService;
    private final UsuarioRepository usuarioRepository;

    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    public Venta buscarPorId(Long id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
    }

    public Venta buscarPorNumeroVenta(String numero) {
        return ventaRepository.findByNumeroVenta(numero)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada"));
    }

    public List<Venta> buscarPorEstado(String estado) {
        return ventaRepository.findByEstado(estado);
    }

    public List<Venta> buscarPorCliente(Long clienteId) {
        return ventaRepository.findByClienteId(clienteId);
    }

    @Transactional
    public Venta crear(Venta venta) {
        Long count = ventaRepository.count() + 1;
        venta.setNumeroVenta("VTA-" + String.format("%06d", count));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        venta.setUsuario(usuario);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalImpuestos = BigDecimal.ZERO;
        BigDecimal totalDescuentos = BigDecimal.ZERO;

        for (VentaDetalle detalle : venta.getDetalles()) {
            detalle.setVenta(venta);

            BigDecimal lineaSubtotal = detalle.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));

            BigDecimal descuento = lineaSubtotal
                    .multiply(detalle.getTasaDescuento())
                    .divide(BigDecimal.valueOf(100));

            BigDecimal baseGravable = lineaSubtotal.subtract(descuento);

            BigDecimal impuesto = baseGravable
                    .multiply(detalle.getTasaImpuesto())
                    .divide(BigDecimal.valueOf(100));

            detalle.setSubtotal(lineaSubtotal);
            detalle.setMontoImpuesto(impuesto);
            detalle.setTotal(baseGravable.add(impuesto));

            subtotal = subtotal.add(lineaSubtotal);
            totalImpuestos = totalImpuestos.add(impuesto);
            totalDescuentos = totalDescuentos.add(descuento);

            productoService.actualizarStock(detalle.getProducto().getId(), -detalle.getCantidad());
        }

        venta.setSubtotal(subtotal);
        venta.setTotalImpuestos(totalImpuestos);
        venta.setTotalDescuentos(totalDescuentos);
        venta.setTotal(subtotal.subtract(totalDescuentos).add(totalImpuestos));

        return ventaRepository.save(venta);
    }

    @Transactional
    public Venta marcarComoFacturada(Long id, String numeroFactura, String cufe, String factusQrUrl) {
        Venta venta = buscarPorId(id);
        venta.setEstado("FACTURADA");
        venta.setNumeroFactura(numeroFactura);
        venta.setCufe(cufe);
        venta.setFactusQrUrl(factusQrUrl);
        return ventaRepository.save(venta);
    }

    @Transactional
    public Venta anular(Long id) {
        Venta venta = buscarPorId(id);
        venta.setEstado("ANULADA");

        for (VentaDetalle detalle : venta.getDetalles()) {
            productoService.actualizarStock(detalle.getProducto().getId(), detalle.getCantidad());
        }

        return ventaRepository.save(venta);
    }
}