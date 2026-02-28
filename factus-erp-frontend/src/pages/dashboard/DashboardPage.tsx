import { useEffect, useState } from 'react';
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
    const [stats, setStats] = useState({ clientes: 0, productos: 0, ventas: 0, facturas: 0 });

    useEffect(() => {
        const load = async () => {
            try {
                const [c, p, v] = await Promise.all([
                    api.get('/erp/clientes').catch(() => ({ data: { data: [] } })),
                    api.get('/erp/productos').catch(() => ({ data: { data: [] } })),
                    api.get('/erp/ventas').catch(() => ({ data: { data: [] } })),
                ]);
                setStats({
                    clientes: c.data?.data?.length || 0,
                    productos: p.data?.data?.length || 0,
                    ventas: v.data?.data?.length || 0,
                    facturas: v.data?.data?.filter((x: any) => x.estado === 'FACTURADA')?.length || 0,
                });
            } catch (e) { console.error(e); }
        };
        load();
    }, []);

    const cards = [
        { label: 'Total Clientes', value: stats.clientes, change: '+12%', icon: UserGroupIcon, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
        { label: 'Productos Activos', value: stats.productos, change: '+5%', icon: CubeIcon, iconBg: 'bg-success/10', iconColor: 'text-success' },
        { label: 'Ventas del Mes', value: stats.ventas, change: '+18%', icon: ShoppingCartIcon, iconBg: 'bg-warning/10', iconColor: 'text-warning' },
        { label: 'Facturas DIAN', value: stats.facturas, change: '+8%', icon: DocumentTextIcon, iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
    ];

    const recentActivities = [
        { action: 'Nueva venta registrada', detail: 'VTA-000001 · $2,500,000', time: 'Hace 5 min', color: 'bg-success' },
        { action: 'Factura electrónica generada', detail: 'SETP990023147 · DIAN', time: 'Hace 12 min', color: 'bg-primary' },
        { action: 'Nuevo cliente registrado', detail: 'Juan Pérez · CC 1234567890', time: 'Hace 30 min', color: 'bg-secondary' },
        { action: 'Stock actualizado', detail: 'Laptop HP · +10 unidades', time: 'Hace 1 hora', color: 'bg-warning' },
        { action: 'Pago recibido', detail: 'CxC-001 · $1,200,000', time: 'Hace 2 horas', color: 'bg-success' },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {cards.map((c, i) => (
                    <div
                        key={c.label}
                        className="card p-5 animate-fade-up"
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                                <c.icon className={`w-5 h-5 ${c.iconColor}`} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-semibold text-success">
                <ArrowUpIcon className="w-3 h-3" />
                                {c.change}
              </span>
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
                            <h3 className="text-sm font-bold text-dark">Resumen de Ventas</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Rendimiento del mes actual</p>
                        </div>
                        <div className="flex gap-2">
                            {['Semana', 'Mes', 'Año'].map((t, i) => (
                                <button key={t} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${i === 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                            <div className="flex items-center gap-2 mb-2">
                                <BanknotesIcon className="w-4 h-4 text-primary" />
                                <span className="text-[11px] font-semibold text-primary">Ingresos</span>
                            </div>
                            <p className="text-lg font-extrabold text-dark">$0</p>
                            <p className="text-[10px] text-gray-400 mt-1">Este mes</p>
                        </div>
                        <div className="bg-success-50 rounded-xl p-4 border border-success/20">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowTrendingUpIcon className="w-4 h-4 text-success" />
                                <span className="text-[11px] font-semibold text-success">Ganancia</span>
                            </div>
                            <p className="text-lg font-extrabold text-dark">$0</p>
                            <p className="text-[10px] text-gray-400 mt-1">Margen neto</p>
                        </div>
                        <div className="bg-warning-50 rounded-xl p-4 border border-warning/20">
                            <div className="flex items-center gap-2 mb-2">
                                <ClockIcon className="w-4 h-4 text-warning" />
                                <span className="text-[11px] font-semibold text-warning">Pendientes</span>
                            </div>
                            <p className="text-lg font-extrabold text-dark">$0</p>
                            <p className="text-[10px] text-gray-400 mt-1">Por cobrar</p>
                        </div>
                    </div>

                    <div className="flex items-end gap-2 h-32">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full rounded-md bg-gradient-to-t from-primary to-primary-light transition-all duration-500 animate-fade-up"
                                    style={{ height: `${h}%`, animationDelay: `${400 + i * 50}ms`, opacity: 0.15 + (h / 100) * 0.85 }}
                                ></div>
                                <span className="text-[9px] text-gray-400">{['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold text-dark">Actividad Reciente</h3>
                        <button className="text-xs text-primary font-semibold hover:underline">Ver todo</button>
                    </div>

                    <div className="space-y-4">
                        {recentActivities.map((act, i) => (
                            <div key={i} className="flex gap-3 animate-slide-right" style={{ animationDelay: `${450 + i * 60}ms` }}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full ${act.color} mt-1`}></div>
                                    {i < recentActivities.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1"></div>}
                                </div>
                                <div className="pb-4">
                                    <p className="text-xs font-semibold text-dark">{act.action}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{act.detail}</p>
                                    <p className="text-[10px] text-gray-300 mt-1">{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-5 card p-5 animate-fade-up" style={{ animationDelay: '500ms' }}>
                <h3 className="text-sm font-bold text-dark mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Nueva Venta', icon: ShoppingCartIcon, color: 'from-primary to-primary-light' },
                        { label: 'Nuevo Cliente', icon: UserGroupIcon, color: 'from-secondary to-blue-400' },
                        { label: 'Agregar Producto', icon: CubeIcon, color: 'from-success to-emerald-400' },
                        { label: 'Generar Factura', icon: DocumentTextIcon, color: 'from-warning to-amber-400' },
                    ].map((a) => (
                        <button
                            key={a.label}
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
        </div>
    );
}