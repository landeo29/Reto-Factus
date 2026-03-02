import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
    UserGroupIcon,
    CubeIcon,
    ShoppingCartIcon,
    DocumentTextIcon,
    ArrowUpIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
    const [stats, setStats] = useState({ clientes: 0, productos: 0, ventas: 0, facturas: 0, totalVentas: 0, totalCompras: 0, margen: 0 });
    const { user, puede } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/erp/reportes/resumen');
                const d = res.data?.data || {};
                setStats({
                    clientes: d.clientesActivos || 0,
                    productos: d.productosActivos || 0,
                    ventas: d.cantidadVentas || 0,
                    facturas: d.ventasFacturadas || 0,
                    totalVentas: d.totalVentas || 0,
                    totalCompras: d.totalCompras || 0,
                    margen: d.margenBruto || 0,
                });
            } catch { console.error('Error cargando resumen'); }
        };
        load();
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

    const cards = [
        { label: 'Total Clientes', value: stats.clientes, icon: UserGroupIcon, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
        { label: 'Productos Activos', value: stats.productos, icon: CubeIcon, iconBg: 'bg-success/10', iconColor: 'text-success' },
        { label: 'Total Ventas', value: stats.ventas, icon: ShoppingCartIcon, iconBg: 'bg-warning/10', iconColor: 'text-warning' },
        { label: 'Facturas DIAN', value: stats.facturas, icon: DocumentTextIcon, iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
    ];

    const acciones = [
        { label: 'Nueva Venta', icon: ShoppingCartIcon, color: 'from-primary to-primary-light', path: '/ventas', modulo: 'ventas' },
        { label: 'Nuevo Cliente', icon: UserGroupIcon, color: 'from-secondary to-blue-400', path: '/clientes', modulo: 'clientes' },
        { label: 'Agregar Producto', icon: CubeIcon, color: 'from-success to-emerald-400', path: '/productos', modulo: 'productos' },
        { label: 'Generar Factura', icon: DocumentTextIcon, color: 'from-warning to-amber-400', path: '/facturas', modulo: 'facturas' },
    ].filter(a => puede(a.modulo, 'crear'));

    return (
        <div>
            <div className="mb-6 animate-fade-up">
                <h1 className="text-lg font-bold text-dark">Bienvenido, {user?.nombreCompleto}</h1>
                <p className="text-xs text-gray-400 mt-0.5">Resumen general del sistema · {user?.rol}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {cards.map((c, i) => (
                    <div key={c.label} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                                <c.icon className={`w-5 h-5 ${c.iconColor}`} />
                            </div>
                        </div>
                        <p className="text-[26px] font-extrabold text-dark tracking-tight">{c.value}</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{c.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div className="xl:col-span-2 card p-6 animate-fade-up" style={{ animationDelay: '320ms' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-dark">Resumen Financiero</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Balance general del negocio</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                            <div className="flex items-center gap-2 mb-2">
                                <BanknotesIcon className="w-4 h-4 text-primary" />
                                <span className="text-[11px] font-semibold text-primary">Ingresos</span>
                            </div>
                            <p className="text-lg font-extrabold text-dark">{formatCurrency(stats.totalVentas)}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{stats.ventas} ventas</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowTrendingUpIcon className="w-4 h-4 text-danger" />
                                <span className="text-[11px] font-semibold text-danger">Egresos</span>
                            </div>
                            <p className="text-lg font-extrabold text-dark">{formatCurrency(stats.totalCompras)}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Compras realizadas</p>
                        </div>
                        <div className={`${stats.margen >= 0 ? 'bg-success-50 border-success/20' : 'bg-red-50 border-red-100'} rounded-xl p-4 border`}>
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpIcon className={`w-4 h-4 ${stats.margen >= 0 ? 'text-success' : 'text-danger'}`} />
                                <span className={`text-[11px] font-semibold ${stats.margen >= 0 ? 'text-success' : 'text-danger'}`}>Margen</span>
                            </div>
                            <p className="text-lg font-extrabold text-dark">{formatCurrency(stats.margen)}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Ingresos - Egresos</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-semibold text-gray-500">Distribución</span>
                        </div>
                        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
                            {stats.totalVentas > 0 && (
                                <>
                                    <div className="h-full bg-success rounded-l-full" style={{ width: `${Math.min((stats.totalVentas / (stats.totalVentas + stats.totalCompras)) * 100, 100)}%` }}></div>
                                    <div className="h-full bg-danger rounded-r-full" style={{ width: `${Math.min((stats.totalCompras / (stats.totalVentas + stats.totalCompras)) * 100, 100)}%` }}></div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-[10px] text-success font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span>Ingresos</span>
                            <span className="text-[10px] text-danger font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger"></span>Egresos</span>
                        </div>
                    </div>
                </div>

                <div className="card p-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-dark">Estado del Sistema</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-dark">API Factus</p>
                                <p className="text-[10px] text-gray-400">Conectado · Sandbox</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-dark">Base de Datos</p>
                                <p className="text-[10px] text-gray-400">PostgreSQL · Activa</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ClockIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-dark">Resolución DIAN</p>
                                <p className="text-[10px] text-gray-400">SETP · 990000000 - 995000000</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <DocumentTextIcon className="w-4 h-4 text-secondary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-dark">{stats.facturas} Facturas Emitidas</p>
                                <p className="text-[10px] text-gray-400">Facturación electrónica activa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {acciones.length > 0 && (
                <div className="mt-5 card p-5 animate-fade-up" style={{ animationDelay: '500ms' }}>
                    <h3 className="text-sm font-bold text-dark mb-4">Acciones Rápidas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {acciones.map((a) => (
                            <button
                                key={a.label}
                                onClick={() => navigate(a.path)}
                                className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                            >
                                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shadow-sm`}>
                                    <a.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 group-hover:text-dark transition-colors">{a.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}