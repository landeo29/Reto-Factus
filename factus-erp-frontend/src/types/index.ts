export interface Usuario {
    id: number;
    username: string;
    nombreCompleto: string;
    email: string;
    telefono: string;
    activo: boolean;
    rol: Rol;
}

export interface Rol {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface Cliente {
    id: number;
    tipoIdentificacion: string;
    numeroIdentificacion: string;
    dv: string;
    nombres: string;
    direccion: string;
    email: string;
    telefono: string;
    organizacionLegalId: string;
    tributoId: string;
    municipioId: string;
    activo: boolean;
}

export interface Proveedor {
    id: number;
    tipoIdentificacion: string;
    numeroIdentificacion: string;
    dv: string;
    nombres: string;
    direccion: string;
    email: string;
    telefono: string;
    personaContacto: string;
    activo: boolean;
}

export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    activo: boolean;
}

export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    precio: number;
    costo: number;
    stock: number;
    stockMinimo: number;
    unidadMedidaId: string;
    tasaImpuesto: number;
    tributoId: string;
    excluidoIva: boolean;
    esServicio: boolean;
    categoria: Categoria;
    activo: boolean;
}

export interface VentaDetalle {
    id?: number;
    producto: Producto;
    cantidad: number;
    precioUnitario: number;
    tasaDescuento: number;
    tasaImpuesto: number;
    subtotal: number;
    montoImpuesto: number;
    total: number;
}

export interface Venta {
    id: number;
    numeroVenta: string;
    numeroFactura: string;
    codigoReferencia: string;
    cliente: Cliente;
    usuario: Usuario;
    codigoMetodoPago: string;
    subtotal: number;
    totalImpuestos: number;
    totalDescuentos: number;
    total: number;
    estado: string;
    cufe: string;
    factusQrUrl: string;
    detalles: VentaDetalle[];
    notas: string;
    creadoEn: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LoginResponse {
    token: string;
    username: string;
    nombreCompleto: string;
    rol: string;
}