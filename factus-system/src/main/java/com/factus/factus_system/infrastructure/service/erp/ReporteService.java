package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.*;
import com.factus.factus_system.core.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final VentaRepository ventaRepository;
    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final ProveedorRepository proveedorRepository;
    private final CuentaPorCobrarRepository cuentaPorCobrarRepository;
    private final CuentaPorPagarRepository cuentaPorPagarRepository;
    private final VentaDetalleRepository ventaDetalleRepository;

    public Map<String, Object> resumenGeneral() {
        Map<String, Object> resumen = new LinkedHashMap<>();

        List<Venta> ventas = ventaRepository.findAll();
        List<Compra> compras = compraRepository.findAll();
        List<Producto> productos = productoRepository.findByActivoTrue();
        List<Cliente> clientes = clienteRepository.findByActivoTrue();

        BigDecimal totalVentas = ventas.stream()
                .filter(v -> !"ANULADA".equals(v.getEstado()))
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCompras = compras.stream()
                .filter(c -> !"ANULADA".equals(c.getEstado()))
                .map(Compra::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long ventasFacturadas = ventas.stream()
                .filter(v -> "FACTURADA".equals(v.getEstado()))
                .count();

        resumen.put("totalVentas", totalVentas);
        resumen.put("totalCompras", totalCompras);
        resumen.put("margenBruto", totalVentas.subtract(totalCompras));
        resumen.put("cantidadVentas", ventas.size());
        resumen.put("cantidadCompras", compras.size());
        resumen.put("ventasFacturadas", ventasFacturadas);
        resumen.put("productosActivos", productos.size());
        resumen.put("clientesActivos", clientes.size());

        return resumen;
    }

    public Map<String, Object> ventasPorPeriodo(LocalDate desde, LocalDate hasta) {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<Venta> ventas = ventaRepository.findByCreadoEnBetween(
                desde.atStartOfDay(), hasta.atTime(LocalTime.MAX));

        // Agrupar por día
        Map<String, BigDecimal> ventasPorDia = new TreeMap<>();
        Map<String, Long> cantidadPorDia = new TreeMap<>();

        for (Venta v : ventas) {
            if ("ANULADA".equals(v.getEstado())) continue;
            String dia = v.getCreadoEn().toLocalDate().toString();
            ventasPorDia.merge(dia, v.getTotal(), BigDecimal::add);
            cantidadPorDia.merge(dia, 1L, Long::sum);
        }

        List<Map<String, Object>> detalle = new ArrayList<>();
        for (String dia : ventasPorDia.keySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("fecha", dia);
            item.put("total", ventasPorDia.get(dia));
            item.put("cantidad", cantidadPorDia.get(dia));
            detalle.add(item);
        }

        BigDecimal totalPeriodo = ventas.stream()
                .filter(v -> !"ANULADA".equals(v.getEstado()))
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        resultado.put("desde", desde.toString());
        resultado.put("hasta", hasta.toString());
        resultado.put("totalPeriodo", totalPeriodo);
        resultado.put("cantidadVentas", ventas.stream().filter(v -> !"ANULADA".equals(v.getEstado())).count());
        resultado.put("detalle", detalle);

        return resultado;
    }

    public Map<String, Object> ventasPorCliente() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<Venta> ventas = ventaRepository.findAll().stream()
                .filter(v -> !"ANULADA".equals(v.getEstado()))
                .collect(Collectors.toList());

        Map<String, BigDecimal> totalesPorCliente = new LinkedHashMap<>();
        Map<String, Long> cantidadPorCliente = new LinkedHashMap<>();

        for (Venta v : ventas) {
            String nombre = v.getCliente() != null ? v.getCliente().getNombres() : "Sin cliente";
            totalesPorCliente.merge(nombre, v.getTotal(), BigDecimal::add);
            cantidadPorCliente.merge(nombre, 1L, Long::sum);
        }

        List<Map<String, Object>> detalle = totalesPorCliente.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(10)
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("cliente", e.getKey());
                    item.put("total", e.getValue());
                    item.put("cantidad", cantidadPorCliente.get(e.getKey()));
                    return item;
                })
                .collect(Collectors.toList());

        resultado.put("topClientes", detalle);
        return resultado;
    }

    public Map<String, Object> productosVendidos() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<Venta> ventas = ventaRepository.findAll().stream()
                .filter(v -> !"ANULADA".equals(v.getEstado()))
                .collect(Collectors.toList());

        Map<String, Integer> cantidades = new LinkedHashMap<>();
        Map<String, BigDecimal> ingresos = new LinkedHashMap<>();

        for (Venta v : ventas) {
            for (VentaDetalle d : v.getDetalles()) {
                String nombre = d.getProducto() != null ? d.getProducto().getNombre() : "Producto desconocido";
                cantidades.merge(nombre, d.getCantidad(), Integer::sum);
                ingresos.merge(nombre, d.getTotal(), BigDecimal::add);
            }
        }

        List<Map<String, Object>> detalle = cantidades.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(10)
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("producto", e.getKey());
                    item.put("cantidadVendida", e.getValue());
                    item.put("ingresos", ingresos.get(e.getKey()));
                    return item;
                })
                .collect(Collectors.toList());

        resultado.put("topProductos", detalle);
        return resultado;
    }

    public Map<String, Object> ventasPorMetodoPago() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        Map<String, String> nombresMetodo = Map.of(
                "10", "Efectivo", "42", "Consignación", "20", "Cheque",
                "47", "Transferencia", "71", "Bonos", "72", "Vales",
                "1", "No definido", "49", "Tarjeta Débito", "48", "Tarjeta Crédito"
        );

        List<Venta> ventas = ventaRepository.findAll().stream()
                .filter(v -> !"ANULADA".equals(v.getEstado()))
                .collect(Collectors.toList());

        Map<String, BigDecimal> totales = new LinkedHashMap<>();
        Map<String, Long> cantidades = new LinkedHashMap<>();

        for (Venta v : ventas) {
            String metodo = nombresMetodo.getOrDefault(v.getCodigoMetodoPago(), "Otro");
            totales.merge(metodo, v.getTotal(), BigDecimal::add);
            cantidades.merge(metodo, 1L, Long::sum);
        }

        List<Map<String, Object>> detalle = totales.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("metodo", e.getKey());
                    item.put("total", e.getValue());
                    item.put("cantidad", cantidades.get(e.getKey()));
                    return item;
                })
                .collect(Collectors.toList());

        resultado.put("metodosPago", detalle);
        return resultado;
    }

    public Map<String, Object> comprasPorProveedor() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<Compra> compras = compraRepository.findAll().stream()
                .filter(c -> !"ANULADA".equals(c.getEstado()))
                .collect(Collectors.toList());

        Map<String, BigDecimal> totales = new LinkedHashMap<>();
        Map<String, Long> cantidades = new LinkedHashMap<>();

        for (Compra c : compras) {
            String nombre = c.getProveedor() != null ? c.getProveedor().getNombres() : "Sin proveedor";
            totales.merge(nombre, c.getTotal(), BigDecimal::add);
            cantidades.merge(nombre, 1L, Long::sum);
        }

        List<Map<String, Object>> detalle = totales.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("proveedor", e.getKey());
                    item.put("total", e.getValue());
                    item.put("cantidad", cantidades.get(e.getKey()));
                    return item;
                })
                .collect(Collectors.toList());

        resultado.put("comprasProveedor", detalle);
        return resultado;
    }

    public Map<String, Object> inventario() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<Producto> productos = productoRepository.findByActivoTrue();

        BigDecimal valorTotal = productos.stream()
                .map(p -> p.getCosto().multiply(BigDecimal.valueOf(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> stockBajo = productos.stream()
                .filter(p -> p.getStock() <= p.getStockMinimo())
                .map(p -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("codigo", p.getCodigo());
                    item.put("nombre", p.getNombre());
                    item.put("stock", p.getStock());
                    item.put("stockMinimo", p.getStockMinimo());
                    item.put("costo", p.getCosto());
                    return item;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> todosProductos = productos.stream()
                .sorted((a, b) -> b.getStock().compareTo(a.getStock()))
                .map(p -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("codigo", p.getCodigo());
                    item.put("nombre", p.getNombre());
                    item.put("stock", p.getStock());
                    item.put("costo", p.getCosto());
                    item.put("valorizado", p.getCosto().multiply(BigDecimal.valueOf(p.getStock())));
                    item.put("categoria", p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin categoría");
                    return item;
                })
                .collect(Collectors.toList());

        resultado.put("valorTotalInventario", valorTotal);
        resultado.put("totalProductos", productos.size());
        resultado.put("productosStockBajo", stockBajo);
        resultado.put("cantidadStockBajo", stockBajo.size());
        resultado.put("productos", todosProductos);

        return resultado;
    }

    public Map<String, Object> rentabilidad() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<Venta> ventas = ventaRepository.findAll().stream()
                .filter(v -> !"ANULADA".equals(v.getEstado()))
                .collect(Collectors.toList());

        List<Compra> compras = compraRepository.findAll().stream()
                .filter(c -> !"ANULADA".equals(c.getEstado()))
                .collect(Collectors.toList());

        BigDecimal totalVentas = ventas.stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCompras = compras.stream().map(Compra::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal margen = totalVentas.subtract(totalCompras);

        BigDecimal porcentajeMargen = BigDecimal.ZERO;
        if (totalVentas.compareTo(BigDecimal.ZERO) > 0) {
            porcentajeMargen = margen.multiply(BigDecimal.valueOf(100)).divide(totalVentas, 2, RoundingMode.HALF_UP);
        }

        // Rentabilidad por producto
        Map<String, BigDecimal> ventasPorProducto = new LinkedHashMap<>();
        Map<String, BigDecimal> costoPorProducto = new LinkedHashMap<>();

        for (Venta v : ventas) {
            for (VentaDetalle d : v.getDetalles()) {
                if (d.getProducto() == null) continue;
                String nombre = d.getProducto().getNombre();
                ventasPorProducto.merge(nombre, d.getTotal(), BigDecimal::add);
                BigDecimal costoLinea = d.getProducto().getCosto().multiply(BigDecimal.valueOf(d.getCantidad()));
                costoPorProducto.merge(nombre, costoLinea, BigDecimal::add);
            }
        }

        List<Map<String, Object>> rentabilidadProducto = ventasPorProducto.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    BigDecimal venta = e.getValue();
                    BigDecimal costo = costoPorProducto.getOrDefault(e.getKey(), BigDecimal.ZERO);
                    BigDecimal ganancia = venta.subtract(costo);
                    BigDecimal pct = venta.compareTo(BigDecimal.ZERO) > 0
                            ? ganancia.multiply(BigDecimal.valueOf(100)).divide(venta, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    item.put("producto", e.getKey());
                    item.put("ingresos", venta);
                    item.put("costo", costo);
                    item.put("ganancia", ganancia);
                    item.put("margen", pct);
                    return item;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("ganancia")).compareTo((BigDecimal) a.get("ganancia")))
                .collect(Collectors.toList());

        resultado.put("totalIngresos", totalVentas);
        resultado.put("totalCostos", totalCompras);
        resultado.put("margenBruto", margen);
        resultado.put("porcentajeMargen", porcentajeMargen);
        resultado.put("rentabilidadProducto", rentabilidadProducto);

        return resultado;
    }

    public Map<String, Object> cartera() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<CuentaPorCobrar> cobrar = cuentaPorCobrarRepository.findAll();
        List<CuentaPorPagar> pagar = cuentaPorPagarRepository.findAll();

        BigDecimal totalPorCobrar = cobrar.stream()
                .filter(c -> !"PAGADA".equals(c.getEstado()))
                .map(CuentaPorCobrar::getSaldo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPorPagar = pagar.stream()
                .filter(c -> !"PAGADA".equals(c.getEstado()))
                .map(CuentaPorPagar::getSaldo)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long vencidasCobrar = cobrar.stream()
                .filter(c -> !"PAGADA".equals(c.getEstado()) && c.getFechaVencimiento().isBefore(LocalDate.now()))
                .count();

        long vencidasPagar = pagar.stream()
                .filter(c -> !"PAGADA".equals(c.getEstado()) && c.getFechaVencimiento().isBefore(LocalDate.now()))
                .count();

        List<Map<String, Object>> cobrarDetalle = cobrar.stream()
                .filter(c -> !"PAGADA".equals(c.getEstado()))
                .sorted(Comparator.comparing(CuentaPorCobrar::getFechaVencimiento))
                .map(c -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("cliente", c.getCliente() != null ? c.getCliente().getNombres() : "—");
                    item.put("monto", c.getMonto());
                    item.put("saldo", c.getSaldo());
                    item.put("vencimiento", c.getFechaVencimiento().toString());
                    item.put("vencida", c.getFechaVencimiento().isBefore(LocalDate.now()));
                    item.put("estado", c.getEstado());
                    return item;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> pagarDetalle = pagar.stream()
                .filter(c -> !"PAGADA".equals(c.getEstado()))
                .sorted(Comparator.comparing(CuentaPorPagar::getFechaVencimiento))
                .map(c -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("proveedor", c.getProveedor() != null ? c.getProveedor().getNombres() : "—");
                    item.put("monto", c.getMonto());
                    item.put("saldo", c.getSaldo());
                    item.put("vencimiento", c.getFechaVencimiento().toString());
                    item.put("vencida", c.getFechaVencimiento().isBefore(LocalDate.now()));
                    item.put("estado", c.getEstado());
                    return item;
                })
                .collect(Collectors.toList());

        resultado.put("totalPorCobrar", totalPorCobrar);
        resultado.put("totalPorPagar", totalPorPagar);
        resultado.put("balance", totalPorCobrar.subtract(totalPorPagar));
        resultado.put("vencidasCobrar", vencidasCobrar);
        resultado.put("vencidasPagar", vencidasPagar);
        resultado.put("detalleCobrar", cobrarDetalle);
        resultado.put("detallePagar", pagarDetalle);

        return resultado;
    }

    public Map<String, Object> tributario() {
        Map<String, Object> resultado = new LinkedHashMap<>();

        List<Venta> facturadas = ventaRepository.findAll().stream()
                .filter(v -> "FACTURADA".equals(v.getEstado()))
                .collect(Collectors.toList());

        BigDecimal totalFacturado = facturadas.stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalIva = facturadas.stream().map(Venta::getTotalImpuestos).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal baseGravable = facturadas.stream().map(Venta::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Por mes
        Map<String, BigDecimal> ivaPorMes = new TreeMap<>();
        Map<String, BigDecimal> ventasPorMes = new TreeMap<>();
        Map<String, Long> cantidadPorMes = new TreeMap<>();

        for (Venta v : facturadas) {
            String mes = v.getCreadoEn().getYear() + "-" + String.format("%02d", v.getCreadoEn().getMonthValue());
            ivaPorMes.merge(mes, v.getTotalImpuestos(), BigDecimal::add);
            ventasPorMes.merge(mes, v.getTotal(), BigDecimal::add);
            cantidadPorMes.merge(mes, 1L, Long::sum);
        }

        List<Map<String, Object>> detalleMes = ivaPorMes.entrySet().stream()
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("mes", e.getKey());
                    item.put("iva", e.getValue());
                    item.put("ventas", ventasPorMes.get(e.getKey()));
                    item.put("cantidad", cantidadPorMes.get(e.getKey()));
                    return item;
                })
                .collect(Collectors.toList());

        resultado.put("totalFacturado", totalFacturado);
        resultado.put("totalIva", totalIva);
        resultado.put("baseGravable", baseGravable);
        resultado.put("facturasEmitidas", facturadas.size());
        resultado.put("detallePorMes", detalleMes);

        return resultado;
    }
}