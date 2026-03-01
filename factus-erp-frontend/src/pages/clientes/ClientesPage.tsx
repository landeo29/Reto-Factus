import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import type { Cliente } from '../../types';
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
            <div className="relative bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col ring-1 ring-gray-200 animate-scale-in">
                {children}
            </div>
        </div>,
        document.body
    );
}

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Cliente | null>(null);
    const [form, setForm] = useState({
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '',
        dv: '',
        nombres: '',
        direccion: '',
        email: '',
        telefono: '',
        organizacionLegalId: '2',
        tributoId: '21',
        municipioId: '149',
    });

    useEffect(() => { loadClientes(); }, []);

    const loadClientes = async () => {
        try {
            const res = await api.get('/erp/clientes');
            setClientes(res.data.data || []);
        } catch { toast.error('Error cargando clientes'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/erp/clientes/${editing.id}`, form);
                toast.success('Cliente actualizado');
            } else {
                await api.post('/erp/clientes', form);
                toast.success('Cliente creado');
            }
            closeModal();
            loadClientes();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Error guardando cliente');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este cliente?')) return;
        try {
            await api.delete(`/erp/clientes/${id}`);
            toast.success('Cliente eliminado');
            loadClientes();
        } catch { toast.error('Error eliminando cliente'); }
    };

    const openEdit = (cliente: Cliente) => {
        setEditing(cliente);
        setForm({
            tipoIdentificacion: cliente.tipoIdentificacion,
            numeroIdentificacion: cliente.numeroIdentificacion,
            dv: cliente.dv || '',
            nombres: cliente.nombres,
            direccion: cliente.direccion || '',
            email: cliente.email || '',
            telefono: cliente.telefono || '',
            organizacionLegalId: cliente.organizacionLegalId || '2',
            tributoId: cliente.tributoId || '21',
            municipioId: cliente.municipioId || '149',
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ tipoIdentificacion: 'CC', numeroIdentificacion: '', dv: '', nombres: '', direccion: '', email: '', telefono: '', organizacionLegalId: '2', tributoId: '21', municipioId: '149' });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); };

    const filtered = clientes.filter(c =>
        c.nombres.toLowerCase().includes(search.toLowerCase()) ||
        c.numeroIdentificacion.includes(search)
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-dark">Clientes</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{clientes.length} registros</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                    <PlusIcon className="w-4 h-4" />
                    Nuevo Cliente
                </button>
            </div>

            <div className="card p-4 mb-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o identificación..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Nombre</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Identificación</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Teléfono</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Estado</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No hay clientes registrados</td></tr>
                        ) : (
                            filtered.map((c, i) => (
                                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {c.nombres.charAt(0)}
                                            </div>
                                            <span className="text-sm font-semibold text-dark">{c.nombres}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono text-gray-500">{c.tipoIdentificacion} {c.numeroIdentificacion}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-gray-500">{c.email || '—'}</td>
                                    <td className="px-5 py-3.5 text-xs text-gray-500">{c.telefono || '—'}</td>
                                    <td className="px-5 py-3.5">
                      <span className={`badge ${c.activo ? 'bg-success-50 text-success' : 'bg-danger-50 text-danger'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors">
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger transition-colors">
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
                        <h2 className="text-sm font-bold text-dark">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{editing ? 'Modifica los datos del cliente' : 'Completa los datos para registrar'}</p>
                    </div>
                    <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                    <div className="p-6 space-y-5">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Identificación</p>
                            <div className="grid grid-cols-5 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo</label>
                                    <select value={form.tipoIdentificacion} onChange={e => setForm({...form, tipoIdentificacion: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all">
                                        <option value="CC">CC - Cédula</option>
                                        <option value="NIT">NIT</option>
                                        <option value="CE">CE - Extranjería</option>
                                        <option value="PP">PP - Pasaporte</option>
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Número</label>
                                    <input type="text" value={form.numeroIdentificacion} onChange={e => setForm({...form, numeroIdentificacion: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="1234567890" required disabled={!!editing} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Información General</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre Completo / Razón Social</label>
                                    <input type="text" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="Juan Pérez López" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="correo@ejemplo.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono</label>
                                        <input type="text" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="300 123 4567" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dirección</label>
                                    <input type="text" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="Calle 123 #45-67, Bogotá" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Datos Tributarios</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Organización</label>
                                    <select value={form.organizacionLegalId} onChange={e => setForm({...form, organizacionLegalId: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all">
                                        <option value="1">Persona Jurídica</option>
                                        <option value="2">Persona Natural</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tributo</label>
                                    <select value={form.tributoId} onChange={e => setForm({...form, tributoId: e.target.value})} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all">
                                        <option value="18">IVA</option>
                                        <option value="21">No aplica</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
                        <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                            {editing ? 'Guardar Cambios' : 'Crear Cliente'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}