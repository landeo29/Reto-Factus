import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import type { Venta, Cliente, Producto } from '../../types';
import toast from 'react-hot-toast';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className={`relative bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-gray-200 animate-scale-in`}>
                {children}
            </div>
        </div>,
        document.body
    );
}

interface ItemForm {
    productoId: string;
    cantidad: string;
    precioUnitario: string;
    tasaDescuento: string;
    tasaImpuesto: string;
}

export default function VentasPage() {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
    const [clienteId, setClienteId] = useState('');
    const [codigoMetodoPago, setCodigoMetodoPago] = useState('10');
    const [notas, setNotas] = useState('');
    const [items, setItems] = useState<ItemForm[]>([]);
    const [facturando, setFacturando] = useState<number | null>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [vRes, cRes, pRes] = await Promise.all([
                api.get('/erp/ventas'),
                api.get('/erp/clientes'),
                api.get('/erp/productos'),
            ]);
            setVentas(vRes.data.data || []);
            setClientes(cRes.data.data || []);
            setProductos(pRes.data.data || []);
        } catch { toast.error('Error cargando datos'); }
        finally { setLoading(false); }
    };

    const addItem = () => {
        setItems([...items, { productoId: '', cantidad: '1', precioUnitario: '', tasaDescuento: '0', tasaImpuesto: '19' }]);
    };

    const updateItem = (index: number, field: keyof ItemForm, value: string) => {
        const updated = [...items];
        updated[index][field] = value;
        if (field === 'productoId') {
            const prod = productos.find(p => p.id === Number(value));
            if (prod) {
                updated[index].precioUnitario = String(prod.precio);
                updated[index].tasaImpuesto = String(prod.tasaImpuesto);
            }
        }
        setItems(updated);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calcSubtotal = () => items.reduce((acc, it) => acc + (Number(it.precioUnitario) * Number(it.cantidad)), 0);
    const calcImpuestos = () => items.reduce((acc, it) => {
        const base = Number(it.precioUnitario) * Number(it.cantidad);
        const desc = base * Number(it.tasaDescuento) / 100;
        return acc + ((base - desc) * Number(it.tasaImpuesto) / 100);
    }, 0);
    const calcDescuentos = () => items.reduce((acc, it) => {
        const base = Number(it.precioUnitario) * Number(it.cantidad);
        return acc + (base * Number(it.tasaDescuento) / 100);
    }, 0);
    const calcTotal = () => calcSubtotal() - calcDescuentos() + calcImpuestos();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) { toast.error('Agrega al menos un producto'); return; }

        try {
            const body = {
                cliente: { id: Number(clienteId) },
                usuario: { id: 1 },
                codigoMetodoPago,
                notas,
                detalles: items.map(it => ({
                    producto: { id: Number(it.productoId) },
                    cantidad: Number(it.cantidad),
                    precioUnitario: Number(it.precioUnitario),
                    tasaDescuento: Number(it.tasaDescuento),
                    tasaImpuesto: Number(it.tasaImpuesto),
                    subtotal: Number(it.precioUnitario) * Number(it.cantidad),
                    montoImpuesto: (Number(it.precioUnitario) * Number(it.cantidad)) * Number(it.tasaImpuesto) / 100,
                    total: (Number(it.precioUnitario) * Number(it.cantidad)) * (1 + Number(it.tasaImpuesto) / 100),
                })),
            };

            await api.post('/erp/ventas', body);
            toast.success('Venta creada');
            closeModal();
            loadData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Error creando venta');
        }
    };

    const facturarDIAN = async (venta: Venta) => {
        setFacturando(venta.id);
        try {
            const cliente = clientes.find(c => c.id === venta.cliente?.id);
            if (!cliente) { toast.error('Cliente no encontrado'); return; }

            const body = {
                numberingRangeId: 8,
                referenceCode: venta.numeroVenta,
                observation: venta.notas || '',
                paymentMethodCode: venta.codigoMetodoPago,
                customer: {
                    identificationDocumentId: cliente.tipoIdentificacion === 'NIT' ? '6' : '3',
                    identification: cliente.numeroIdentificacion,
                    dv: cliente.dv || '',
                    names: cliente.nombres,
                    email: cliente.email || 'sin@email.com',
                    phone: cliente.telefono || '0000000',
                    address: cliente.direccion || 'Sin dirección',
                    legalOrganizationId: cliente.organizacionLegalId || '2',
                    tributeId: cliente.tributoId || '18',
                    municipalityId: cliente.municipioId || '149',
                },
                items: venta.detalles.map((d) => ({
                    codeReference: d.producto?.codigo || 'PROD-001',
                    name: d.producto?.nombre || 'Producto',
                    quantity: d.cantidad,
                    discountRate: d.tasaDescuento || 0,
                    price: d.precioUnitario,
                    taxRate: String(d.tasaImpuesto || '19'),
                    unitMeasureId: 70,
                    standardCodeId: 1,
                    isExcluded: d.tasaImpuesto === 0 ? 1 : 0,
                    tributeId: 1,
                    withholdingTaxes: [],
                })),
            };

            const res = await api.post('/invoices', body);
            const facturaData = res.data.data;

            if (facturaData) {
                const numero = facturaData.bill?.number || facturaData.number || '';
                const cufe = facturaData.bill?.cufe || facturaData.cufe || '';
                const qr = facturaData.bill?.qr_image || facturaData.qr_image || '';

                await api.put(`/erp/ventas/${venta.id}/facturar`, {
                    numeroFactura: numero,
                    cufe: cufe,
                    factusQrUrl: qr,
                });

                toast.success('Factura DIAN generada: ' + numero);
                loadData();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Error facturando');
        } finally {
            setFacturando(null);
        }
    };

    const openCreate = () => {
        setClienteId('');
        setCodigoMetodoPago('10');
        setNotas('');
        setItems([]);
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); };

    const openDetail = (v: Venta) => { setSelectedVenta(v); setShowDetail(true); };

    const filtered = ventas.filter(v =>
        v.numeroVenta?.toLowerCase().includes(search.toLowerCase()) ||
        v.numeroFactura?.toLowerCase().includes(search.toLowerCase()) ||
        v.estado?.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    const estadoBadge = (estado: string) => {
        const map: Record<string, string> = {
            PENDIENTE: 'bg-warning-50 text-warning',
            FACTURADA: 'bg-success-50 text-success',
            ANULADA: 'bg-danger-50 text-danger',
        };
        return map[estado] || 'bg-gray-100 text-gray-500';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-dark">Ventas</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{ventas.length} registros</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                    <PlusIcon className="w-4 h-4" />
                    Nueva Venta
                </button>
            </div>

            <div className="card p-4 mb-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número de venta, factura o estado..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">N° Venta</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Factura DIAN</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Total</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Estado</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Fecha</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">No hay ventas registradas</td></tr>
                        ) : (
                            filtered.map((v, i) => (
                                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm font-semibold text-dark">{v.numeroVenta}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono text-primary">{v.numeroFactura || '—'}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs text-gray-500">{v.cliente?.nombres || '—'}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-sm font-semibold text-dark">{formatCurrency(v.total)}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`badge ${estadoBadge(v.estado)}`}>{v.estado}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-gray-500">
                                        {v.creadoEn ? new Date(v.creadoEn).toLocaleDateString('es-CO') : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openDetail(v)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors" title="Ver detalle">
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            {v.estado === 'PENDIENTE' && (
                                                <button onClick={() => facturarDIAN(v)} disabled={facturando === v.id} className="p-2 rounded-lg hover:bg-success-50 text-gray-400 hover:text-success transition-colors disabled:opacity-50" title="Facturar DIAN">
                                                    {facturando === v.id ? (
                                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                    ) : (
                                                        <PaperAirplaneIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            {v.numeroFactura && (
                                                <button onClick={() => window.open(`http://localhost:8080/api/invoices/${v.numeroFactura}/pdf`, '_blank')} className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary transition-colors" title="Ver PDF">
                                                    <DocumentTextIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={showModal} onClose={closeModal} wide>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-sm font-bold text-dark">Nueva Venta</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Registra una venta y genera factura DIAN</p>
                    </div>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                    <div className="p-6 space-y-5">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Datos Generales</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Cliente</label>
                                    <select value={clienteId} onChange={e => setClienteId(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" required>
                                        <option value="">Seleccionar cliente</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombres} - {c.numeroIdentificacion}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Método de Pago</label>
                                    <select value={codigoMetodoPago} onChange={e => setCodigoMetodoPago(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all">
                                        <option value="10">Efectivo</option>
                                        <option value="47">Transferencia</option>
                                        <option value="48">Tarjeta Crédito</option>
                                        <option value="49">Tarjeta Débito</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notas</label>
                                <input type="text" value={notas} onChange={e => setNotas(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="Observaciones (opcional)" />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Productos</p>
                                <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100 transition-colors">
                                    <PlusIcon className="w-3.5 h-3.5" />
                                    Agregar
                                </button>
                            </div>

                            {items.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-400">Agrega productos a la venta</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                            <div className="grid grid-cols-12 gap-2 items-end">
                                                <div className="col-span-4">
                                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Producto</label>
                                                    <select value={item.productoId} onChange={e => updateItem(idx, 'productoId', e.target.value)} className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-dark focus:border-primary outline-none" required>
                                                        <option value="">Seleccionar</option>
                                                        {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>)}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Cant.</label>
                                                    <input type="number" min="1" value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-dark focus:border-primary outline-none" required />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Precio</label>
                                                    <input type="number" value={item.precioUnitario} onChange={e => updateItem(idx, 'precioUnitario', e.target.value)} className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-dark focus:border-primary outline-none" required />
                                                </div>
                                                <div className="col-span-1">
                                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Desc%</label>
                                                    <input type="number" value={item.tasaDescuento} onChange={e => updateItem(idx, 'tasaDescuento', e.target.value)} className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-xs text-dark focus:border-primary outline-none" />
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Subtotal</label>
                                                    <p className="text-xs font-semibold text-dark py-2">{formatCurrency(Number(item.precioUnitario) * Number(item.cantidad))}</p>
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    <button type="button" onClick={() => removeItem(idx)} className="p-1.5 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger transition-colors">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="bg-dark rounded-xl p-4 text-white">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span>{formatCurrency(calcSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Descuentos</span>
                                        <span className="text-danger">-{formatCurrency(calcDescuentos())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Impuestos (IVA)</span>
                                        <span>{formatCurrency(calcImpuestos())}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-700 text-base font-bold">
                                        <span>Total</span>
                                        <span className="text-primary-light">{formatCurrency(calcTotal())}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
                        <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                            Crear Venta
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal open={showDetail} onClose={() => setShowDetail(false)} wide>
                {selectedVenta && (
                    <>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                            <div>
                                <h2 className="text-sm font-bold text-dark">Detalle Venta {selectedVenta.numeroVenta}</h2>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {selectedVenta.numeroFactura && `Factura DIAN: ${selectedVenta.numeroFactura}`}
                                </p>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                                <XMarkIcon className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 space-y-5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Cliente</p>
                                    <p className="text-sm font-semibold text-dark mt-1">{selectedVenta.cliente?.nombres}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Estado</p>
                                    <span className={`badge mt-1 ${estadoBadge(selectedVenta.estado)}`}>{selectedVenta.estado}</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                                    <p className="text-sm font-bold text-dark mt-1">{formatCurrency(selectedVenta.total)}</p>
                                </div>
                            </div>

                            {selectedVenta.cufe && (
                                <div className="bg-primary-50 rounded-xl p-3 border border-primary-100">
                                    <p className="text-[10px] font-bold text-primary uppercase">CUFE</p>
                                    <p className="text-[11px] font-mono text-gray-600 mt-1 break-all">{selectedVenta.cufe}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Productos</p>
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left text-[10px] font-bold text-gray-500 uppercase py-2">Producto</th>
                                        <th className="text-center text-[10px] font-bold text-gray-500 uppercase py-2">Cant.</th>
                                        <th className="text-right text-[10px] font-bold text-gray-500 uppercase py-2">Precio</th>
                                        <th className="text-right text-[10px] font-bold text-gray-500 uppercase py-2">Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedVenta.detalles?.map((d, i) => (
                                        <tr key={i} className="border-b border-gray-100">
                                            <td className="py-2 text-xs text-dark font-medium">{d.producto?.nombre}</td>
                                            <td className="py-2 text-xs text-gray-500 text-center">{d.cantidad}</td>
                                            <td className="py-2 text-xs text-gray-500 text-right">{formatCurrency(d.precioUnitario)}</td>
                                            <td className="py-2 text-xs font-semibold text-dark text-right">{formatCurrency(d.total)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-dark rounded-xl p-4 text-white">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{formatCurrency(selectedVenta.subtotal)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Descuentos</span><span className="text-danger">-{formatCurrency(selectedVenta.totalDescuentos)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Impuestos</span><span>{formatCurrency(selectedVenta.totalImpuestos)}</span></div>
                                    <div className="flex justify-between pt-2 border-t border-gray-700 text-base font-bold"><span>Total</span><span className="text-primary-light">{formatCurrency(selectedVenta.total)}</span></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}