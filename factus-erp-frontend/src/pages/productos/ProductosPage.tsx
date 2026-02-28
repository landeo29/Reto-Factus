import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import type { Producto, Categoria } from '../../types';
import toast from 'react-hot-toast';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col ring-1 ring-gray-200 animate-scale-in">
                {children}
            </div>
        </div>,
        document.body
    );
}

export default function ProductosPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Producto | null>(null);
    const [form, setForm] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: '',
        costo: '',
        stock: '',
        stockMinimo: '',
        unidadMedidaId: '70',
        tasaImpuesto: '19',
        tributoId: '01',
        excluidoIva: false,
        esServicio: false,
        categoriaId: '',
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/erp/productos'),
                api.get('/erp/categorias'),
            ]);
            setProductos(prodRes.data.data || []);
            setCategorias(catRes.data.data || []);
        } catch { toast.error('Error cargando datos'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                codigo: form.codigo,
                nombre: form.nombre,
                descripcion: form.descripcion,
                precio: Number(form.precio),
                costo: Number(form.costo),
                stock: Number(form.stock),
                stockMinimo: Number(form.stockMinimo),
                unidadMedidaId: form.unidadMedidaId,
                tasaImpuesto: Number(form.tasaImpuesto),
                tributoId: form.tributoId,
                excluidoIva: form.excluidoIva,
                esServicio: form.esServicio,
                categoria: form.categoriaId ? { id: Number(form.categoriaId) } : null,
            };

            if (editing) {
                await api.put(`/erp/productos/${editing.id}`, body);
                toast.success('Producto actualizado');
            } else {
                await api.post('/erp/productos', body);
                toast.success('Producto creado');
            }
            closeModal();
            loadData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Error guardando producto');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await api.delete(`/erp/productos/${id}`);
            toast.success('Producto eliminado');
            loadData();
        } catch { toast.error('Error eliminando producto'); }
    };

    const openEdit = (p: Producto) => {
        setEditing(p);
        setForm({
            codigo: p.codigo,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio: String(p.precio),
            costo: String(p.costo),
            stock: String(p.stock),
            stockMinimo: String(p.stockMinimo),
            unidadMedidaId: p.unidadMedidaId || '70',
            tasaImpuesto: String(p.tasaImpuesto),
            tributoId: p.tributoId || '01',
            excluidoIva: p.excluidoIva,
            esServicio: p.esServicio,
            categoriaId: p.categoria ? String(p.categoria.id) : '',
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ codigo: '', nombre: '', descripcion: '', precio: '', costo: '', stock: '', stockMinimo: '', unidadMedidaId: '70', tasaImpuesto: '19', tributoId: '01', excluidoIva: false, esServicio: false, categoriaId: '' });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); };

    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-dark">Productos</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{productos.length} registros</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                    <PlusIcon className="w-4 h-4" />
                    Nuevo Producto
                </button>
            </div>

            <div className="card p-4 mb-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o código..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Producto</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Código</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Categoría</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Precio</th>
                            <th className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Stock</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Estado</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-sm text-gray-400">No hay productos registrados</td></tr>
                        ) : (
                            filtered.map((p, i) => (
                                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success text-xs font-bold">
                                                {p.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-dark block">{p.nombre}</span>
                                                {p.esServicio && <span className="text-[10px] text-primary font-medium">Servicio</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono text-gray-500">{p.codigo}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs text-gray-500">{p.categoria?.nombre || '—'}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-sm font-semibold text-dark">{formatCurrency(p.precio)}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                      <span className={`badge ${p.stock <= p.stockMinimo ? 'bg-danger-50 text-danger' : 'bg-success-50 text-success'}`}>
                        {p.stock}
                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                      <span className={`badge ${p.activo ? 'bg-success-50 text-success' : 'bg-danger-50 text-danger'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger transition-colors">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={showModal} onClose={closeModal}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-sm font-bold text-dark">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{editing ? 'Modifica los datos del producto' : 'Completa los datos para registrar'}</p>
                    </div>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                    <div className="p-6 space-y-5">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Información Básica</p>
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Código</label>
                                        <input type="text" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="PROD-001" required disabled={!!editing} />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre</label>
                                        <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="Laptop HP 15" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción</label>
                                    <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={2} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all resize-none" placeholder="Descripción del producto" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoría</label>
                                        <select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all">
                                            <option value="">Sin categoría</option>
                                            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unidad Medida</label>
                                        <select value={form.unidadMedidaId} onChange={e => setForm({...form, unidadMedidaId: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all">
                                            <option value="70">Unidad (70)</option>
                                            <option value="94">Otro (94)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Precios e Inventario</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Precio Venta</label>
                                    <input type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="0" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Costo</label>
                                    <input type="number" value={form.costo} onChange={e => setForm({...form, costo: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock</label>
                                    <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock Mínimo</label>
                                    <input type="number" value={form.stockMinimo} onChange={e => setForm({...form, stockMinimo: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="0" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Impuestos</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tributo</label>
                                    <select value={form.tributoId} onChange={e => setForm({...form, tributoId: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all">
                                        <option value="01">IVA</option>
                                        <option value="04">INC</option>
                                        <option value="ZA">No Aplica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tasa %</label>
                                    <input type="number" value={form.tasaImpuesto} onChange={e => setForm({...form, tasaImpuesto: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="19" />
                                </div>
                            </div>
                            <div className="flex gap-6 mt-3">
                                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                    <input type="checkbox" checked={form.esServicio} onChange={e => setForm({...form, esServicio: e.target.checked})} className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    Es servicio
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                    <input type="checkbox" checked={form.excluidoIva} onChange={e => setForm({...form, excluidoIva: e.target.checked})} className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    Excluido de IVA
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
                        <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                            {editing ? 'Guardar Cambios' : 'Crear Producto'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}