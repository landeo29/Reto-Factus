package com.factus.factus_system.infrastructure.service.erp;

import com.factus.factus_system.core.entity.Producto;
import com.factus.factus_system.core.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findByActivoTrue();
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public Producto buscarPorCodigo(String codigo) {
        return productoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + codigo));
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public List<Producto> buscarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId);
    }

    public List<Producto> productosStockBajo() {
        return productoRepository.findByStockLessThanEqual(0);
    }

    public Producto crear(Producto producto) {
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto datos) {
        Producto producto = buscarPorId(id);
        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        producto.setPrecio(datos.getPrecio());
        producto.setCosto(datos.getCosto());
        producto.setStock(datos.getStock());
        producto.setStockMinimo(datos.getStockMinimo());
        producto.setTasaImpuesto(datos.getTasaImpuesto());
        producto.setCategoria(datos.getCategoria());
        return productoRepository.save(producto);
    }

    public void actualizarStock(Long id, Integer cantidad) {
        Producto producto = buscarPorId(id);
        producto.setStock(producto.getStock() + cantidad);
        productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        Producto producto = buscarPorId(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }
}