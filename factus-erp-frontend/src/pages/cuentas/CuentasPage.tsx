import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import type { CuentaPorCobrar, CuentaPorPagar } from '../../types';
import toast from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    BanknotesIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col ring-1 ring-gray-200 animate-scale-in">
                {children}
            </div>
        </div>,
        document.body
    );
}

export default function CuentasPage() {
    const [tab, setTab] = useState<'cobrar' | 'pagar'>('cobrar');
    const [cuentasCobrar, setCuentasCobrar] = useState<CuentaPorCobrar[]>([]);
    const [cuentasPagar, setCuentasPagar] = useState<CuentaPorPagar[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [pagoTipo, setPagoTipo] = useState<'cobrar' | 'pagar'>('cobrar');
    const [pagoId, setPagoId] = useState<number | null>(null);
    const [pagoMonto, setPagoMonto] = useState('');
    const [pagoSaldo, setPagoSaldo] = useState(0);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [cobrarRes, pagarRes] = await Promise.all([
                api.get('/erp/cuentas-cobrar'),
                api.get('/erp/cuentas-pagar'),
            ]);
            setCuentasCobrar(cobrarRes.data.data || []);
            setCuentasPagar(pagarRes.data.data || []);
        } catch { toast.error('Error cargando cuentas'); }
        finally { setLoading(false); }
    };

    const openPago = (tipo: 'cobrar' | 'pagar', id: number, saldo: number) => {
        setPagoTipo(tipo);
        setPagoId(id);
        setPagoSaldo(saldo);
        setPagoMonto('');
        setShowPagoModal(true);
    };

    const handlePago = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pagoId) return;
        const monto = Number(pagoMonto);
        if (monto <= 0) { toast.error('El monto debe ser mayor a 0'); return; }
        if (monto > pagoSaldo) { toast.error('El monto no puede superar el saldo'); return; }

        try {
            const endpoint = pagoTipo === 'cobrar'
                ? `/erp/cuentas-cobrar/${pagoId}/pago?monto=${monto}`
                : `/erp/cuentas-pagar/${pagoId}/pago?monto=${monto}`;
            await api.put(endpoint);
            toast.success('Pago registrado');
            setShowPagoModal(false);
            loadData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Error registrando pago');
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    const estadoBadge = (estado: string) => {
        const map: Record<string, string> = {
            PENDIENTE: 'bg-warning-50 text-warning',
            PARCIAL: 'bg-info-50 text-info',
            PAGADA: 'bg-success-50 text-success',
            VENCIDA: 'bg-danger-50 text-danger',
        };
        return map[estado] || 'bg-gray-100 text-gray-500';
    };

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('es-CO') : '—';

    const isVencida = (fecha: string) => {
        if (!fecha) return false;
        return new Date(fecha) < new Date();
    };

    const filteredCobrar = cuentasCobrar.filter(c =>
        c.cliente?.nombres?.toLowerCase().includes(search.toLowerCase()) ||
        c.venta?.numeroVenta?.toLowerCase().includes(search.toLowerCase()) ||
        c.estado?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredPagar = cuentasPagar.filter(c =>
        c.proveedor?.nombres?.toLowerCase().includes(search.toLowerCase()) ||
        c.compra?.numeroCompra?.toLowerCase().includes(search.toLowerCase()) ||
        c.estado?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPorCobrar = cuentasCobrar.reduce((acc, c) => acc + (c.saldo || 0), 0);
    const totalPorPagar = cuentasPagar.reduce((acc, c) => acc + (c.saldo || 0), 0);
    const vencidasCobrar = cuentasCobrar.filter(c => c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento)).length;
    const vencidasPagar = cuentasPagar.filter(c => c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento)).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-dark">Cuentas por Cobrar / Pagar</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Gestión de deudas y pagos</p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Por Cobrar</p>
                    <p className="text-lg font-bold text-success mt-1">{formatCurrency(totalPorCobrar)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{cuentasCobrar.length} cuentas</p>
                </div>
                <div className="card p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Por Pagar</p>
                    <p className="text-lg font-bold text-danger mt-1">{formatCurrency(totalPorPagar)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{cuentasPagar.length} cuentas</p>
                </div>
                <div className="card p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Balance</p>
                    <p className={`text-lg font-bold mt-1 ${totalPorCobrar - totalPorPagar >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(totalPorCobrar - totalPorPagar)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Cobrar - Pagar</p>
                </div>
                <div className="card p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Vencidas</p>
                    <p className="text-lg font-bold text-danger mt-1">{vencidasCobrar + vencidasPagar}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{vencidasCobrar} cobrar · {vencidasPagar} pagar</p>
                </div>
            </div>

            <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setTab('cobrar')}
                    className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'cobrar' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                >
                    Por Cobrar ({cuentasCobrar.length})
                </button>
                <button
                    onClick={() => setTab('pagar')}
                    className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'pagar' ? 'bg-white text-dark shadow-sm' : 'text-gray-500 hover:text-dark'}`}
                >
                    Por Pagar ({cuentasPagar.length})
                </button>
            </div>

            <div className="card p-4 mb-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Buscar por ${tab === 'cobrar' ? 'cliente' : 'proveedor'}, número o estado...`} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" />
                </div>
            </div>

            {tab === 'cobrar' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50/50">
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Venta</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Monto</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Pagado</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Saldo</th>
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Vencimiento</th>
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Estado</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">Cargando...</td></tr>
                            ) : filteredCobrar.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">No hay cuentas por cobrar</td></tr>
                            ) : (
                                filteredCobrar.map((c, i) => (
                                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success text-xs font-bold">
                                                    {c.cliente?.nombres?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-semibold text-dark">{c.cliente?.nombres}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs font-mono text-gray-500">{c.venta?.numeroVenta || '—'}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm text-dark">{formatCurrency(c.monto)}</td>
                                        <td className="px-5 py-3.5 text-right text-sm text-success">{formatCurrency(c.montoPagado)}</td>
                                        <td className="px-5 py-3.5 text-right text-sm font-semibold text-dark">{formatCurrency(c.saldo)}</td>
                                        <td className="px-5 py-3.5">
                        <span className={`text-xs ${c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento) ? 'text-danger font-semibold' : 'text-gray-500'}`}>
                          {formatDate(c.fechaVencimiento)}
                        </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                        <span className={`badge ${estadoBadge(c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento) ? 'VENCIDA' : c.estado)}`}>
                          {c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento) ? 'VENCIDA' : c.estado}
                        </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end">
                                                {c.estado !== 'PAGADA' && (
                                                    <button onClick={() => openPago('cobrar', c.id, c.saldo)} className="p-2 rounded-lg hover:bg-success-50 text-gray-400 hover:text-success transition-colors" title="Registrar cobro">
                                                        <BanknotesIcon className="w-4 h-4" />
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
            )}

            {tab === 'pagar' && (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 bg-gray-50/50">
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Proveedor</th>
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Compra</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Monto</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Pagado</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Saldo</th>
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Vencimiento</th>
                                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Estado</th>
                                <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">Cargando...</td></tr>
                            ) : filteredPagar.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">No hay cuentas por pagar</td></tr>
                            ) : (
                                filteredPagar.map((c, i) => (
                                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger text-xs font-bold">
                                                    {c.proveedor?.nombres?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-sm font-semibold text-dark">{c.proveedor?.nombres}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-xs font-mono text-gray-500">{c.compra?.numeroCompra || '—'}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm text-dark">{formatCurrency(c.monto)}</td>
                                        <td className="px-5 py-3.5 text-right text-sm text-success">{formatCurrency(c.montoPagado)}</td>
                                        <td className="px-5 py-3.5 text-right text-sm font-semibold text-dark">{formatCurrency(c.saldo)}</td>
                                        <td className="px-5 py-3.5">
                        <span className={`text-xs ${c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento) ? 'text-danger font-semibold' : 'text-gray-500'}`}>
                          {formatDate(c.fechaVencimiento)}
                        </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                        <span className={`badge ${estadoBadge(c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento) ? 'VENCIDA' : c.estado)}`}>
                          {c.estado !== 'PAGADA' && isVencida(c.fechaVencimiento) ? 'VENCIDA' : c.estado}
                        </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end">
                                                {c.estado !== 'PAGADA' && (
                                                    <button onClick={() => openPago('pagar', c.id, c.saldo)} className="p-2 rounded-lg hover:bg-danger-50 text-gray-400 hover:text-danger transition-colors" title="Registrar pago">
                                                        <BanknotesIcon className="w-4 h-4" />
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
            )}

            <Modal open={showPagoModal} onClose={() => setShowPagoModal(false)}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                    <div>
                        <h2 className="text-sm font-bold text-dark">
                            {pagoTipo === 'cobrar' ? 'Registrar Cobro' : 'Registrar Pago'}
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Saldo pendiente: {formatCurrency(pagoSaldo)}</p>
                    </div>
                    <button onClick={() => setShowPagoModal(false)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handlePago} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Monto a {pagoTipo === 'cobrar' ? 'cobrar' : 'pagar'}</label>
                        <input
                            type="number"
                            value={pagoMonto}
                            onChange={e => setPagoMonto(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-300 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                            placeholder="0"
                            min="1"
                            max={pagoSaldo}
                            required
                        />
                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={() => setPagoMonto(String(pagoSaldo))} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100 transition-colors">
                            Pago total
                        </button>
                        <button type="button" onClick={() => setPagoMonto(String(Math.round(pagoSaldo / 2)))} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                            50%
                        </button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowPagoModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] ${pagoTipo === 'cobrar' ? 'bg-gradient-to-r from-success to-emerald-500 hover:shadow-lg hover:shadow-success/25' : 'bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25'}`}>
                            Confirmar {pagoTipo === 'cobrar' ? 'Cobro' : 'Pago'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}