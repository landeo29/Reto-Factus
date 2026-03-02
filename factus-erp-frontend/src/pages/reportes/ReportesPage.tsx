import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    BarChart, Bar as ReBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line,
    PieChart, Pie, Cell,
    AreaChart, Area,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ComposedChart,
    Scatter,
    ScatterChart,
    ReferenceLine,
} from 'recharts';
import {
    ChartBarIcon,
    CubeIcon,
    UserGroupIcon,
    BanknotesIcon,
    ShoppingCartIcon,
    TruckIcon,
    DocumentTextIcon,
    ArrowTrendingUpIcon,
    CalendarDaysIcon,
    CreditCardIcon,
} from '@heroicons/react/24/outline';

type TabKey = 'resumen' | 'ventasPeriodo' | 'ventasCliente' | 'productosVendidos' | 'ventasMetodo' | 'comprasProveedor' | 'inventario' | 'rentabilidad' | 'cartera' | 'tributario';

interface TabItem {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const tabsList: TabItem[] = [
    { key: 'resumen', label: 'Resumen', icon: ChartBarIcon },
    { key: 'ventasPeriodo', label: 'Ventas x Período', icon: CalendarDaysIcon },
    { key: 'ventasCliente', label: 'Ventas x Cliente', icon: UserGroupIcon },
    { key: 'productosVendidos', label: 'Top Productos', icon: CubeIcon },
    { key: 'ventasMetodo', label: 'Métodos de Pago', icon: CreditCardIcon },
    { key: 'comprasProveedor', label: 'Compras x Proveedor', icon: TruckIcon },
    { key: 'inventario', label: 'Inventario', icon: ShoppingCartIcon },
    { key: 'rentabilidad', label: 'Rentabilidad', icon: ArrowTrendingUpIcon },
    { key: 'cartera', label: 'Cartera', icon: BanknotesIcon },
    { key: 'tributario', label: 'Tributario', icon: DocumentTextIcon },
];

// Paleta premium con degradados
const PALETTE = {
    primary: '#6366f1',
    success: '#10b981',
    danger: '#f43f5e',
    warning: '#f59e0b',
    info: '#0ea5e9',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6',
    orange: '#f97316',
    slate: '#64748b',
};

const COLORS = Object.values(PALETTE);

const CHART_GRADIENTS = [
    { id: 'grad0', start: '#6366f1', end: '#818cf8' },
    { id: 'grad1', start: '#10b981', end: '#34d399' },
    { id: 'grad2', start: '#f43f5e', end: '#fb7185' },
    { id: 'grad3', start: '#f59e0b', end: '#fbbf24' },
    { id: 'grad4', start: '#0ea5e9', end: '#38bdf8' },
    { id: 'grad5', start: '#8b5cf6', end: '#a78bfa' },
];

const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val || 0);

const formatShort = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
};

const formatPct = (val: number) => `${(val || 0).toFixed(1)}%`;

/* ─────────────────── Shared Gradient Defs ─────────────────── */
const GradientDefs = () => (
    <defs>
        {CHART_GRADIENTS.map(g => (
            <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.start} stopOpacity={0.9} />
                <stop offset="100%" stopColor={g.end} stopOpacity={0.7} />
            </linearGradient>
        ))}
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="areaSuccessGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
        </linearGradient>
    </defs>
);

/* ─────────────────── Custom Tooltip ─────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(15,15,30,0.95)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 12,
            padding: '10px 14px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
            <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: '0.05em' }}>
                {label}
            </p>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
                    <span style={{ color: '#e2e8f0', fontSize: 12 }}>{p.name}: </span>
                    <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
                        {typeof p.value === 'number' && p.value > 1000 ? formatCOP(p.value) : p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ─────────────────── KPI Card ─────────────────── */
interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
    color?: string;
    trend?: number;
    icon?: React.ComponentType<{ className?: string }>;
}
const KpiCard = ({ label, value, sub, color = PALETTE.primary, trend, icon: Icon }: KpiCardProps) => (
    <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden',
    }}>
        {/* Decorative accent */}
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            borderRadius: '16px 16px 0 0',
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    {label}
                </p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {value}
                </p>
                {sub && (
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>{sub}</p>
                )}
            </div>
            {Icon && (
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: `${color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            )}
        </div>
        {typeof trend === 'number' && (
            <div style={{
                marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: 4,
            }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: trend >= 0 ? PALETTE.success : PALETTE.danger }}>
                    {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>vs. período anterior</span>
            </div>
        )}
    </div>
);

/* ─────────────────── Chart Card wrapper ─────────────────── */
const ChartCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
    <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 20px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
    }}>
        <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{title}</p>
            {subtitle && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{subtitle}</p>}
        </div>
        {children}
    </div>
);

/* ─────────────────── Table wrapper ─────────────────── */
const DataTable = ({ headers, rows, emptyMsg = 'Sin datos' }: {
    headers: { label: string; align?: 'left' | 'center' | 'right' }[];
    rows: React.ReactNode[][];
    emptyMsg?: string;
}) => (
    <div style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.05)',
    }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {headers.map((h, i) => (
                    <th key={i} style={{
                        textAlign: h.align || 'left',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        padding: '12px 16px',
                    }}>
                        {h.label}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {rows.length === 0 ? (
                <tr>
                    <td colSpan={headers.length} style={{ textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: 13 }}>
                        {emptyMsg}
                    </td>
                </tr>
            ) : rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    {row.map((cell, ci) => (
                        <td key={ci} style={{
                            padding: '11px 16px',
                            textAlign: headers[ci]?.align || 'left',
                            fontSize: 13,
                            color: '#0f172a',
                        }}>
                            {cell}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

/* ─────────────────── Rank Badge ─────────────────── */
const Rank = ({ n }: { n: number }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 24, height: 24, borderRadius: '50%',
        background: n <= 3
            ? ['#fef9c3', '#f1f5f9', '#fef3e2'][n - 1]
            : '#f1f5f9',
        color: n <= 3
            ? ['#854d0e', '#475569', '#92400e'][n - 1]
            : '#64748b',
        fontSize: 11, fontWeight: 800,
    }}>
        {n}
    </span>
);

/* ─────────────────── Status Badge ─────────────────── */
const Badge = ({ label, type }: { label: string; type: 'danger' | 'warning' | 'success' | 'neutral' }) => {
    const styles: Record<string, { bg: string; color: string }> = {
        danger: { bg: '#fef2f2', color: '#ef4444' },
        warning: { bg: '#fffbeb', color: '#d97706' },
        success: { bg: '#f0fdf4', color: '#16a34a' },
        neutral: { bg: '#f8fafc', color: '#64748b' },
    };
    const s = styles[type];
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 6,
            background: s.bg, color: s.color, fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
            {label}
        </span>
    );
};

/* ═══════════════════════════════════════════════════════ */
export default function ReportesPage() {
    const [tab, setTab] = useState<TabKey>('resumen');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Record<string, any>>({});

    const hoy = new Date();
    const hace30 = new Date(hoy);
    hace30.setDate(hace30.getDate() - 30);
    const [desde, setDesde] = useState(hace30.toISOString().split('T')[0]);
    const [hasta, setHasta] = useState(hoy.toISOString().split('T')[0]);

    useEffect(() => { loadTab(tab); }, [tab]);

    const loadTab = async (t: TabKey) => {
        if (data[t] && t !== 'ventasPeriodo') return;
        setLoading(true);
        try {
            let res: any;
            switch (t) {
                case 'resumen': res = await api.get('/erp/reportes/resumen'); break;
                case 'ventasPeriodo': res = await api.get(`/erp/reportes/ventas-periodo?desde=${desde}&hasta=${hasta}`); break;
                case 'ventasCliente': res = await api.get('/erp/reportes/ventas-cliente'); break;
                case 'productosVendidos': res = await api.get('/erp/reportes/productos-vendidos'); break;
                case 'ventasMetodo': res = await api.get('/erp/reportes/ventas-metodo-pago'); break;
                case 'comprasProveedor': res = await api.get('/erp/reportes/compras-proveedor'); break;
                case 'inventario': res = await api.get('/erp/reportes/inventario'); break;
                case 'rentabilidad': res = await api.get('/erp/reportes/rentabilidad'); break;
                case 'cartera': res = await api.get('/erp/reportes/cartera'); break;
                case 'tributario': res = await api.get('/erp/reportes/tributario'); break;
            }
            setData(prev => ({ ...prev, [t]: res?.data?.data || {} }));
        } catch { toast.error('Error cargando reporte'); }
        finally { setLoading(false); }
    };

    const d = data[tab] || {};

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Reportes</h1>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Análisis completo del negocio</p>
                </div>
            </div>

            {/* ─── Tabs ─── */}
            <div style={{ marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
                <div style={{
                    display: 'flex', gap: 4,
                    background: '#f1f5f9',
                    padding: 4, borderRadius: 14,
                    width: 'fit-content', minWidth: '100%',
                }}>
                    {tabsList.map(t => {
                        const active = tab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '7px 12px', borderRadius: 10,
                                    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                                    border: 'none', cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    background: active ? '#fff' : 'transparent',
                                    color: active ? '#0f172a' : '#94a3b8',
                                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                <t.icon style={{ width: 13, height: 13 }} />
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Loading ─── */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
                        animation: 'spin 0.7s linear infinite',
                    }} />
                    <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>Cargando reporte...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ══════════════ RESUMEN ══════════════ */}
                    {tab === 'resumen' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                <KpiCard label="Total Ventas" value={formatCOP(d.totalVentas)} sub={`${d.cantidadVentas || 0} ventas`} color={PALETTE.success} icon={ArrowTrendingUpIcon} />
                                <KpiCard label="Total Compras" value={formatCOP(d.totalCompras)} sub={`${d.cantidadCompras || 0} compras`} color={PALETTE.danger} icon={ShoppingCartIcon} />
                                <KpiCard label="Margen Bruto" value={formatCOP(d.margenBruto)} color={(d.margenBruto || 0) >= 0 ? PALETTE.primary : PALETTE.danger} icon={ChartBarIcon} />
                                <KpiCard label="Facturas DIAN" value={String(d.ventasFacturadas || 0)} sub={`${d.productosActivos || 0} prod. · ${d.clientesActivos || 0} clientes`} color={PALETTE.warning} icon={DocumentTextIcon} />
                            </div>

                            {/* Ventas vs Compras: ComposedChart más informativo */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                                <ChartCard title="Ventas · Compras · Margen" subtitle="Comparativa global del período">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <ComposedChart data={[
                                            { name: 'Ventas', valor: d.totalVentas || 0, tipo: 'ingreso' },
                                            { name: 'Compras', valor: d.totalCompras || 0, tipo: 'egreso' },
                                            { name: 'Margen', valor: d.margenBruto || 0, tipo: 'margen' },
                                        ]} barSize={52}>
                                            <GradientDefs />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 8 }} />
                                            <ReBar dataKey="valor" radius={[8, 8, 0, 0]}>
                                                <Cell fill={`url(#grad1)`} />
                                                <Cell fill={`url(#grad2)`} />
                                                <Cell fill={`url(#grad0)`} />
                                            </ReBar>
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                {/* Donut de distribución */}
                                <ChartCard title="Distribución" subtitle="Ventas vs Compras">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <GradientDefs />
                                            <Pie
                                                data={[
                                                    { name: 'Ventas', value: d.totalVentas || 0 },
                                                    { name: 'Compras', value: d.totalCompras || 0 },
                                                ]}
                                                cx="50%" cy="50%"
                                                outerRadius={100} innerRadius={58}
                                                paddingAngle={4}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                            >
                                                <Cell fill={PALETTE.success} />
                                                <Cell fill={PALETTE.danger} />
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </>
                    )}

                    {/* ══════════════ VENTAS POR PERÍODO ══════════════ */}
                    {tab === 'ventasPeriodo' && (
                        <>
                            {/* Filtro */}
                            <div style={{
                                background: '#fff', borderRadius: 16, padding: '16px 20px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
                                display: 'flex', alignItems: 'flex-end', gap: 12,
                            }}>
                                {['Desde', 'Hasta'].map((lbl, i) => (
                                    <div key={lbl}>
                                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                                            {lbl}
                                        </label>
                                        <input
                                            type="date"
                                            value={i === 0 ? desde : hasta}
                                            onChange={e => i === 0 ? setDesde(e.target.value) : setHasta(e.target.value)}
                                            style={{
                                                padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                                                fontSize: 13, color: '#0f172a', outline: 'none',
                                                background: '#fff',
                                            }}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => { setData(prev => ({ ...prev, ventasPeriodo: undefined })); loadTab('ventasPeriodo'); }}
                                    style={{
                                        padding: '8px 20px', borderRadius: 10, border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                                    }}
                                >
                                    Consultar
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <KpiCard label="Total del Período" value={formatCOP(d.totalPeriodo)} color={PALETTE.primary} icon={BanknotesIcon} />
                                <KpiCard label="Ventas Realizadas" value={String(d.cantidadVentas || 0)} color={PALETTE.success} icon={ChartBarIcon} />
                            </div>

                            {(d.detalle || []).length > 0 && (
                                <>
                                    <ChartCard title="Tendencia de Ventas" subtitle="Evolución diaria del período seleccionado">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={d.detalle}>
                                                <GradientDefs />
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" height={55} axisLine={false} tickLine={false} />
                                                <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)" name="Total" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <DataTable
                                        headers={[
                                            { label: 'Fecha' },
                                            { label: 'Ventas', align: 'center' },
                                            { label: 'Total', align: 'right' },
                                        ]}
                                        rows={d.detalle.map((item: any) => [
                                            <span style={{ fontWeight: 600 }}>{item.fecha}</span>,
                                            <span style={{ color: '#64748b' }}>{item.cantidad}</span>,
                                            <span style={{ fontWeight: 700, color: '#6366f1' }}>{formatCOP(item.total)}</span>,
                                        ])}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {/* ══════════════ VENTAS POR CLIENTE ══════════════ */}
                    {tab === 'ventasCliente' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16 }}>
                                {/* Donut */}
                                <ChartCard title="Participación por Cliente" subtitle="% del total de ventas">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={(d.topClientes || []).map((c: any) => ({ name: c.cliente, value: c.total }))}
                                                cx="50%" cy="50%"
                                                outerRadius={110} innerRadius={55}
                                                paddingAngle={3}
                                                dataKey="value"
                                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {(d.topClientes || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Leyenda inline */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 8 }}>
                                        {(d.topClientes || []).map((c: any, i: number) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                                <span style={{ fontSize: 11, color: '#64748b' }}>{c.cliente}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>

                                {/* Horizontal bar */}
                                <ChartCard title="Top Clientes por Monto" subtitle="Ranking de ventas acumuladas">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={d.topClientes || []} layout="vertical" barSize={18}>
                                            <GradientDefs />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                            <XAxis type="number" tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis type="category" dataKey="cliente" width={130} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                                            <ReBar dataKey="total" name="Total" radius={[0, 8, 8, 0]}>
                                                {(d.topClientes || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </ReBar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            <DataTable
                                headers={[
                                    { label: '#' },
                                    { label: 'Cliente' },
                                    { label: 'Compras', align: 'center' },
                                    { label: 'Total', align: 'right' },
                                ]}
                                rows={(d.topClientes || []).map((item: any, i: number) => [
                                    <Rank n={i + 1} />,
                                    <span style={{ fontWeight: 600 }}>{item.cliente}</span>,
                                    <span style={{ color: '#64748b' }}>{item.cantidad}</span>,
                                    <span style={{ fontWeight: 700 }}>{formatCOP(item.total)}</span>,
                                ])}
                                emptyMsg="No hay datos de clientes"
                            />
                        </>
                    )}

                    {/* ══════════════ PRODUCTOS VENDIDOS ══════════════ */}
                    {tab === 'productosVendidos' && (
                        <>
                            {/* ComposedChart: barras + línea de ingresos */}
                            <ChartCard title="Top 10 Productos Más Vendidos" subtitle="Unidades vendidas vs ingresos generados">
                                <ResponsiveContainer width="100%" height={360}>
                                    <ComposedChart data={d.topProductos || []}>
                                        <GradientDefs />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="producto" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-20} textAnchor="end" height={70} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
                                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                                        <ReBar yAxisId="left" dataKey="cantidadVendida" name="Uds. Vendidas" fill={`url(#grad0)`} radius={[6, 6, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="ingresos" name="Ingresos" stroke={PALETTE.success} strokeWidth={2.5} dot={{ fill: PALETTE.success, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <DataTable
                                headers={[
                                    { label: '#' },
                                    { label: 'Producto' },
                                    { label: 'Uds. Vendidas', align: 'center' },
                                    { label: 'Ingresos', align: 'right' },
                                ]}
                                rows={(d.topProductos || []).map((item: any, i: number) => [
                                    <Rank n={i + 1} />,
                                    <span style={{ fontWeight: 600 }}>{item.producto}</span>,
                                    <span style={{ color: '#64748b' }}>{item.cantidadVendida}</span>,
                                    <span style={{ fontWeight: 700, color: PALETTE.success }}>{formatCOP(item.ingresos)}</span>,
                                ])}
                                emptyMsg="No hay datos de productos"
                            />
                        </>
                    )}

                    {/* ══════════════ MÉTODOS DE PAGO ══════════════ */}
                    {tab === 'ventasMetodo' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {/* Donut con label externo */}
                                <ChartCard title="Distribución por Método" subtitle="Participación porcentual en ventas">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={(d.metodosPago || []).map((m: any) => ({ name: m.metodo, value: m.total }))}
                                                cx="50%" cy="50%"
                                                outerRadius={100} innerRadius={52}
                                                paddingAngle={4}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                            >
                                                {(d.metodosPago || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                {/* Barras verticales */}
                                <ChartCard title="Monto por Método de Pago" subtitle="Total transaccionado por canal">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={d.metodosPago || []} barSize={44}>
                                            <GradientDefs />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="metodo" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
                                            <ReBar dataKey="total" name="Total" radius={[8, 8, 0, 0]}>
                                                {(d.metodosPago || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </ReBar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            <DataTable
                                headers={[
                                    { label: 'Método' },
                                    { label: 'Transacciones', align: 'center' },
                                    { label: 'Total', align: 'right' },
                                ]}
                                rows={(d.metodosPago || []).map((item: any, i: number) => [
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                        <span style={{ fontWeight: 600 }}>{item.metodo}</span>
                                    </div>,
                                    <span style={{ color: '#64748b' }}>{item.cantidad}</span>,
                                    <span style={{ fontWeight: 700 }}>{formatCOP(item.total)}</span>,
                                ])}
                            />
                        </>
                    )}

                    {/* ══════════════ COMPRAS POR PROVEEDOR ══════════════ */}
                    {tab === 'comprasProveedor' && (
                        <>
                            <ChartCard title="Compras por Proveedor" subtitle="Ranking de proveedores por monto total">
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={d.comprasProveedor || []} layout="vertical" barSize={20}>
                                        <GradientDefs />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="proveedor" width={150} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(244,63,94,0.04)' }} />
                                        <ReBar dataKey="total" name="Total" fill={`url(#grad2)`} radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <DataTable
                                headers={[
                                    { label: 'Proveedor' },
                                    { label: 'Compras', align: 'center' },
                                    { label: 'Total', align: 'right' },
                                ]}
                                rows={(d.comprasProveedor || []).map((item: any) => [
                                    <span style={{ fontWeight: 600 }}>{item.proveedor}</span>,
                                    <span style={{ color: '#64748b' }}>{item.cantidad}</span>,
                                    <span style={{ fontWeight: 700, color: PALETTE.danger }}>{formatCOP(item.total)}</span>,
                                ])}
                                emptyMsg="No hay datos de compras"
                            />
                        </>
                    )}

                    {/* ══════════════ INVENTARIO ══════════════ */}
                    {tab === 'inventario' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                <KpiCard label="Valor Inventario" value={formatCOP(d.valorTotalInventario)} color={PALETTE.primary} icon={CubeIcon} />
                                <KpiCard label="Productos Activos" value={String(d.totalProductos || 0)} color={PALETTE.success} icon={ShoppingCartIcon} />
                                <KpiCard label="Stock Bajo / Agotado" value={String(d.cantidadStockBajo || 0)} color={PALETTE.danger} icon={TruckIcon} />
                            </div>

                            {(d.productos || []).length > 0 && (
                                <ChartCard title="Stock por Producto (top 15)" subtitle="Rojo = bajo mínimo · Índigo = normal">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={(d.productos || []).slice(0, 15)} barSize={28}>
                                            <GradientDefs />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="nombre" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-25} textAnchor="end" height={70} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
                                            <ReBar dataKey="stock" name="Stock" radius={[6, 6, 0, 0]}>
                                                {(d.productos || []).slice(0, 15).map((p: any, i: number) => (
                                                    <Cell key={i} fill={p.stock <= (p.stockMinimo || 0) ? PALETTE.danger : PALETTE.primary} />
                                                ))}
                                            </ReBar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}

                            {(d.productosStockBajo || []).length > 0 && (
                                <>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: PALETTE.danger }}>⚠️ Productos con stock bajo o agotado</p>
                                    <DataTable
                                        headers={[
                                            { label: 'Código' },
                                            { label: 'Producto' },
                                            { label: 'Stock', align: 'center' },
                                            { label: 'Mínimo', align: 'center' },
                                        ]}
                                        rows={(d.productosStockBajo || []).map((p: any) => [
                                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{p.codigo}</span>,
                                            <span style={{ fontWeight: 600 }}>{p.nombre}</span>,
                                            <span style={{ fontWeight: 700, color: p.stock === 0 ? PALETTE.danger : PALETTE.warning }}>{p.stock}</span>,
                                            <span style={{ color: '#64748b' }}>{p.stockMinimo}</span>,
                                        ])}
                                    />
                                </>
                            )}

                            <DataTable
                                headers={[
                                    { label: 'Código' },
                                    { label: 'Producto' },
                                    { label: 'Categoría' },
                                    { label: 'Stock', align: 'center' },
                                    { label: 'Costo Und.', align: 'right' },
                                    { label: 'Valor Total', align: 'right' },
                                ]}
                                rows={(d.productos || []).map((p: any) => [
                                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{p.codigo}</span>,
                                    <span style={{ fontWeight: 600 }}>{p.nombre}</span>,
                                    <span style={{ color: '#64748b', fontSize: 11 }}>{p.categoria}</span>,
                                    <span style={{ fontWeight: 600 }}>{p.stock}</span>,
                                    <span style={{ color: '#64748b', fontSize: 12 }}>{formatCOP(p.costo)}</span>,
                                    <span style={{ fontWeight: 700 }}>{formatCOP(p.valorizado)}</span>,
                                ])}
                            />
                        </>
                    )}

                    {/* ══════════════ RENTABILIDAD ══════════════ */}
                    {tab === 'rentabilidad' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                <KpiCard label="Ingresos" value={formatCOP(d.totalIngresos)} color={PALETTE.success} icon={ArrowTrendingUpIcon} />
                                <KpiCard label="Costos" value={formatCOP(d.totalCostos)} color={PALETTE.danger} icon={ShoppingCartIcon} />
                                <KpiCard label="Margen Bruto" value={formatCOP(d.margenBruto)} color={(d.margenBruto || 0) >= 0 ? PALETTE.primary : PALETTE.danger} icon={ChartBarIcon} />
                                <KpiCard label="% Margen" value={formatPct(d.porcentajeMargen)} color={(d.porcentajeMargen || 0) >= 0 ? PALETTE.success : PALETTE.danger} icon={DocumentTextIcon} />
                            </div>

                            {(d.rentabilidadProducto || []).length > 0 && (
                                <ChartCard title="Ingresos vs Costos por Producto" subtitle="Comparativa para identificar productos más rentables">
                                    <ResponsiveContainer width="100%" height={360}>
                                        <ComposedChart data={d.rentabilidadProducto || []}>
                                            <GradientDefs />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="producto" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-20} textAnchor="end" height={70} axisLine={false} tickLine={false} />
                                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 8 }} />
                                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                                            <ReBar dataKey="ingresos" name="Ingresos" fill={`url(#grad1)`} radius={[6, 6, 0, 0]} />
                                            <ReBar dataKey="costo" name="Costo" fill={`url(#grad2)`} radius={[6, 6, 0, 0]} />
                                            <Line type="monotone" dataKey="ganancia" name="Ganancia" stroke={PALETTE.primary} strokeWidth={2} dot={{ fill: PALETTE.primary, r: 3 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}

                            <DataTable
                                headers={[
                                    { label: 'Producto' },
                                    { label: 'Ingresos', align: 'right' },
                                    { label: 'Costo', align: 'right' },
                                    { label: 'Ganancia', align: 'right' },
                                    { label: 'Margen', align: 'right' },
                                ]}
                                rows={(d.rentabilidadProducto || []).map((item: any) => [
                                    <span style={{ fontWeight: 600 }}>{item.producto}</span>,
                                    <span style={{ color: '#64748b', fontSize: 12 }}>{formatCOP(item.ingresos)}</span>,
                                    <span style={{ color: '#64748b', fontSize: 12 }}>{formatCOP(item.costo)}</span>,
                                    <span style={{ fontWeight: 700, color: item.ganancia >= 0 ? PALETTE.success : PALETTE.danger }}>{formatCOP(item.ganancia)}</span>,
                                    <Badge label={formatPct(item.margen)} type={item.margen >= 30 ? 'success' : item.margen >= 0 ? 'warning' : 'danger'} />,
                                ])}
                                emptyMsg="No hay datos de rentabilidad"
                            />
                        </>
                    )}

                    {/* ══════════════ CARTERA ══════════════ */}
                    {tab === 'cartera' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                <KpiCard label="Por Cobrar" value={formatCOP(d.totalPorCobrar)} color={PALETTE.success} icon={BanknotesIcon} />
                                <KpiCard label="Por Pagar" value={formatCOP(d.totalPorPagar)} color={PALETTE.danger} icon={CreditCardIcon} />
                                <KpiCard label="Balance" value={formatCOP(d.balance)} color={(d.balance || 0) >= 0 ? PALETTE.primary : PALETTE.danger} icon={ChartBarIcon} />
                                <KpiCard label="Vencidas" value={String((d.vencidasCobrar || 0) + (d.vencidasPagar || 0))} color={PALETTE.warning} icon={DocumentTextIcon} />
                            </div>

                            {((d.totalPorCobrar || 0) > 0 || (d.totalPorPagar || 0) > 0) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <ChartCard title="Distribución de Cartera" subtitle="Por cobrar vs por pagar">
                                        <ResponsiveContainer width="100%" height={260}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Por Cobrar', value: d.totalPorCobrar || 0 },
                                                        { name: 'Por Pagar', value: d.totalPorPagar || 0 },
                                                    ]}
                                                    cx="50%" cy="50%"
                                                    outerRadius={100} innerRadius={55}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                                >
                                                    <Cell fill={PALETTE.success} />
                                                    <Cell fill={PALETTE.danger} />
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <ChartCard title="Balance Neto" subtitle="Diferencia entre cobrar y pagar">
                                        <ResponsiveContainer width="100%" height={260}>
                                            <BarChart data={[
                                                { name: 'Por Cobrar', valor: d.totalPorCobrar || 0 },
                                                { name: 'Por Pagar', valor: d.totalPorPagar || 0 },
                                                { name: 'Balance', valor: d.balance || 0 },
                                            ]} barSize={50}>
                                                <GradientDefs />
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                                <ReBar dataKey="valor" radius={[8, 8, 0, 0]}>
                                                    <Cell fill={PALETTE.success} />
                                                    <Cell fill={PALETTE.danger} />
                                                    <Cell fill={(d.balance || 0) >= 0 ? PALETTE.primary : PALETTE.warning} />
                                                </ReBar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartCard>
                                </div>
                            )}

                            {(d.detalleCobrar || []).length > 0 && (
                                <>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Cuentas por Cobrar Pendientes</p>
                                    <DataTable
                                        headers={[
                                            { label: 'Cliente' },
                                            { label: 'Monto', align: 'right' },
                                            { label: 'Saldo', align: 'right' },
                                            { label: 'Vencimiento' },
                                            { label: 'Estado' },
                                        ]}
                                        rows={(d.detalleCobrar || []).map((c: any) => [
                                            <span style={{ fontWeight: 600 }}>{c.cliente}</span>,
                                            <span style={{ color: '#64748b', fontSize: 12 }}>{formatCOP(c.monto)}</span>,
                                            <span style={{ fontWeight: 700 }}>{formatCOP(c.saldo)}</span>,
                                            <span style={{ fontSize: 12, color: c.vencida ? PALETTE.danger : '#64748b', fontWeight: c.vencida ? 700 : 400 }}>{c.vencimiento}</span>,
                                            <Badge label={c.vencida ? 'VENCIDA' : c.estado} type={c.vencida ? 'danger' : 'warning'} />,
                                        ])}
                                    />
                                </>
                            )}

                            {(d.detallePagar || []).length > 0 && (
                                <>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Cuentas por Pagar Pendientes</p>
                                    <DataTable
                                        headers={[
                                            { label: 'Proveedor' },
                                            { label: 'Monto', align: 'right' },
                                            { label: 'Saldo', align: 'right' },
                                            { label: 'Vencimiento' },
                                            { label: 'Estado' },
                                        ]}
                                        rows={(d.detallePagar || []).map((c: any) => [
                                            <span style={{ fontWeight: 600 }}>{c.proveedor}</span>,
                                            <span style={{ color: '#64748b', fontSize: 12 }}>{formatCOP(c.monto)}</span>,
                                            <span style={{ fontWeight: 700 }}>{formatCOP(c.saldo)}</span>,
                                            <span style={{ fontSize: 12, color: c.vencida ? PALETTE.danger : '#64748b', fontWeight: c.vencida ? 700 : 400 }}>{c.vencimiento}</span>,
                                            <Badge label={c.vencida ? 'VENCIDA' : c.estado} type={c.vencida ? 'danger' : 'warning'} />,
                                        ])}
                                    />
                                </>
                            )}

                            {(!d.detalleCobrar || d.detalleCobrar.length === 0) && (!d.detallePagar || d.detallePagar.length === 0) && (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 }}>No hay cuentas pendientes</div>
                            )}
                        </>
                    )}

                    {/* ══════════════ TRIBUTARIO ══════════════ */}
                    {tab === 'tributario' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                <KpiCard label="Total Facturado" value={formatCOP(d.totalFacturado)} color={PALETTE.primary} icon={DocumentTextIcon} />
                                <KpiCard label="Base Gravable" value={formatCOP(d.baseGravable)} color={PALETTE.info} icon={ChartBarIcon} />
                                <KpiCard label="IVA Generado" value={formatCOP(d.totalIva)} color={PALETTE.warning} icon={BanknotesIcon} />
                                <KpiCard label="Facturas Emitidas" value={String(d.facturasEmitidas || 0)} color={PALETTE.success} icon={CreditCardIcon} />
                            </div>

                            {(d.detallePorMes || []).length > 0 && (
                                <ChartCard title="Ventas e IVA por Mes" subtitle="Evolución mensual de facturación y cargas tributarias">
                                    <ResponsiveContainer width="100%" height={360}>
                                        <ComposedChart data={d.detallePorMes || []}>
                                            <GradientDefs />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <YAxis tickFormatter={formatShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                                            <ReBar dataKey="ventas" name="Ventas" fill={`url(#grad0)`} radius={[6, 6, 0, 0]} />
                                            <ReBar dataKey="iva" name="IVA" fill={`url(#grad3)`} radius={[6, 6, 0, 0]} />
                                            <Line type="monotone" dataKey="ventas" name="" stroke="transparent" legendType="none" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}

                            <DataTable
                                headers={[
                                    { label: 'Mes' },
                                    { label: 'Facturas', align: 'center' },
                                    { label: 'Ventas', align: 'right' },
                                    { label: 'IVA', align: 'right' },
                                ]}
                                rows={(d.detallePorMes || []).map((item: any) => [
                                    <span style={{ fontWeight: 600 }}>{item.mes}</span>,
                                    <span style={{ color: '#64748b' }}>{item.cantidad}</span>,
                                    <span style={{ color: '#64748b', fontSize: 12 }}>{formatCOP(item.ventas)}</span>,
                                    <span style={{ fontWeight: 700, color: PALETTE.warning }}>{formatCOP(item.iva)}</span>,
                                ])}
                                emptyMsg="No hay facturas emitidas"
                            />
                        </>
                    )}

                </div>
            )}
        </div>
    );
}