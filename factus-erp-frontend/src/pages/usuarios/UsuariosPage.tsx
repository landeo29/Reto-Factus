import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface Rol {
    id: number;
    nombre: string;
    descripcion: string;
}

interface Usuario {
    id: number;
    username: string;
    email: string;
    nombreCompleto: string;
    telefono: string;
    activo: boolean;
    rol: Rol;
    creadoEn: string;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col ring-1 ring-gray-200">
                {children}
            </div>
        </div>,
        document.body
    );
}

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Usuario | null>(null);

    // Form
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [rolId, setRolId] = useState('');
    const [activo, setActivo] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usuariosRes, rolesRes] = await Promise.all([
                api.get('/erp/usuarios'),
                api.get('/erp/roles'),
            ]);
            setUsuarios(usuariosRes.data.data || []);
            setRoles(rolesRes.data.data || []);
        } catch {
            toast.error('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditing(null);
        setUsername('');
        setEmail('');
        setNombreCompleto('');
        setTelefono('');
        setPassword('');
        setRolId('');
        setActivo(true);
        setShowModal(true);
    };

    const openEdit = (u: Usuario) => {
        setEditing(u);
        setUsername(u.username);
        setEmail(u.email || '');
        setNombreCompleto(u.nombreCompleto || '');
        setTelefono(u.telefono || '');
        setPassword('');
        setRolId(String(u.rol?.id || ''));
        setActivo(u.activo);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !rolId) {
            toast.error('Username y rol son requeridos');
            return;
        }
        if (!editing && !password) {
            toast.error('La contraseña es requerida para nuevo usuario');
            return;
        }

        setSaving(true);
        try {
            const body: any = {
                username,
                email,
                nombreCompleto,
                telefono,
                activo,
                rol: { id: Number(rolId) },
            };

            if (password) {
                body.password = password;
            }

            if (editing) {
                await api.put(`/erp/usuarios/${editing.id}`, body);
                toast.success('Usuario actualizado');
            } else {
                await api.post('/erp/usuarios', body);
                toast.success('Usuario creado');
            }

            setShowModal(false);
            loadData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Error guardando usuario');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`¿Eliminar usuario "${name}"?`)) return;
        try {
            await api.delete(`/erp/usuarios/${id}`);
            toast.success('Usuario eliminado');
            loadData();
        } catch {
            toast.error('Error eliminando usuario');
        }
    };

    const toggleActivo = async (u: Usuario) => {
        try {
            await api.put(`/erp/usuarios/${u.id}`, {
                ...u,
                rol: { id: u.rol.id },
                activo: !u.activo,
            });
            toast.success(u.activo ? 'Usuario desactivado' : 'Usuario activado');
            loadData();
        } catch {
            toast.error('Error actualizando usuario');
        }
    };

    const filtered = usuarios.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.nombreCompleto?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.rol?.nombre?.toLowerCase().includes(search.toLowerCase())
    );

    const rolBadge = (nombre: string) => {
        const map: Record<string, string> = {
            ADMIN: 'bg-purple-50 text-purple-600',
            VENDEDOR: 'bg-blue-50 text-blue-600',
            CONTADOR: 'bg-amber-50 text-amber-600',
            ALMACENERO: 'bg-emerald-50 text-emerald-600',
        };
        return map[nombre] || 'bg-gray-100 text-gray-500';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-dark">Usuarios</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{usuarios.length} usuarios registrados</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]">
                    <PlusIcon className="w-4 h-4" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Search */}
            <div className="card p-4 mb-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, usuario, email o rol..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" />
                </div>
            </div>

            {/* Tabla */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Usuario</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Teléfono</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Rol</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Estado</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-sm text-gray-400">No hay usuarios</td></tr>
                        ) : (
                            filtered.map((u, i) => (
                                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold">
                                                {u.nombreCompleto?.charAt(0) || u.username?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-dark block">{u.nombreCompleto || u.username}</span>
                                                <span className="text-[10px] text-gray-400">@{u.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-gray-500">{u.email || '—'}</td>
                                    <td className="px-5 py-3.5 text-sm text-gray-500">{u.telefono || '—'}</td>
                                    <td className="px-5 py-3.5">
                      <span className={`badge ${rolBadge(u.rol?.nombre)}`}>
                        <ShieldCheckIcon className="w-3 h-3 inline mr-1" />
                          {u.rol?.nombre}
                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => toggleActivo(u)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${u.activo ? 'bg-success-50 text-success hover:bg-success/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary transition-colors" title="Editar">
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(u.id, u.nombreCompleto || u.username)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-danger transition-colors" title="Eliminar">
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

            {/* Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-sm font-bold text-dark">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">{editing ? 'Modificar datos del usuario' : 'Crear una nueva cuenta de usuario'}</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username *</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="usuario" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="email@ejemplo.com" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre Completo</label>
                        <input type="text" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="Juan Pérez" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Teléfono</label>
                            <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder="3001234567" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Rol *</label>
                            <select value={rolId} onChange={e => setRolId(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" required>
                                <option value="">Seleccionar rol</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.nombre} - {r.descripcion}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Contraseña {editing ? '(dejar vacío para no cambiar)' : '*'}
                        </label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'} />
                    </div>

                    {editing && (
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-gray-600">Estado:</label>
                            <button type="button" onClick={() => setActivo(!activo)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activo ? 'bg-success-50 text-success' : 'bg-gray-100 text-gray-400'}`}>
                                {activo ? 'Activo' : 'Inactivo'}
                            </button>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50">
                            {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}