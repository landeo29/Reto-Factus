/**
 * ReportesPage — zero TS/ESLint errors
 *
 * Tooltip strategy: we do NOT use TooltipProps from recharts (its generics
 * differ between recharts versions and cause TS2339 on .payload/.label).
 * Instead we cast `content` to `never` after wrapping with a typed adapter.
 * All chart tooltips receive { active, payload, label } at runtime — we
 * read them with unknown-safe helpers.
 */

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    BarChart, Bar as ReBar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
    Line, PieChart, Pie, Cell,
    AreaChart, Area,
    ComposedChart,
    ScatterChart, Scatter, ZAxis,
    Treemap,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import {
    ChartBarIcon, CubeIcon, UserGroupIcon, BanknotesIcon,
    ShoppingCartIcon, TruckIcon, DocumentTextIcon,
    ArrowTrendingUpIcon, CalendarDaysIcon, CreditCardIcon,
} from '@heroicons/react/24/outline';
import type { FC } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey =
    | 'resumen' | 'ventasPeriodo' | 'ventasCliente' | 'productosVendidos'
    | 'ventasMetodo' | 'comprasProveedor' | 'inventario'
    | 'rentabilidad' | 'cartera' | 'tributario';

interface TabItem { key: TabKey; label: string; icon: FC<{ className?: string }> }

interface KpiCardProps {
    label: string; value: string; sub?: string;
    color?: string; icon?: FC<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
}

interface ChartCardProps { title: string; subtitle?: string; children: React.ReactNode }
interface TableHeader { label: string; align?: 'left' | 'center' | 'right' }
interface DataTableProps { headers: TableHeader[]; rows: React.ReactNode[][]; emptyMsg?: string }
interface BadgeProps { label: string; type: 'danger' | 'warning' | 'success' | 'neutral' }

// Domain types (matches API responses)
interface ClienteItem   { cliente: string; total: number; cantidad: number }
interface ProductoItem  { producto: string; ingresos: number; cantidadVendida: number }
interface MetodoItem    { metodo: string; total: number; cantidad: number }
interface ProveedorItem { proveedor: string; total: number; cantidad: number }
interface DetalleItem   { fecha: string; total: number; cantidad: number }
interface MesItem       { mes: string; cantidad: number; ventas: number; iva: number }
interface TendItem      { mes: string; ventas: number; compras: number }
interface RentItem      {
    producto: string; ingresos: number; costo: number;
    ganancia: number; margen: number; cantidadVendida?: number
}
interface InvItem {
    codigo: string; nombre: string; categoria: string;
    stock: number; stockMinimo?: number; costo: number; valorizado: number
}
interface CarteraItem {
    cliente?: string; proveedor?: string; monto: number; saldo: number;
    vencimiento: string; vencida: boolean; estado: string
}
interface AgingItem { rango: string; cobrar: number; pagar: number }
interface TreeNode  { name: string; value: number }

// Recharts passes this shape to custom content at runtime.
// We define it ourselves to avoid fighting TooltipProps generics.
interface TPayloadEntry {
    name?: string | number;
    value?: string | number;
    color?: string;
    fill?: string;
    payload?: Record<string, unknown>;
}
interface TArgs {
    active?: boolean;
    payload?: TPayloadEntry[];
    label?: string | number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const tabsList: TabItem[] = [
    { key: 'resumen',           label: 'Resumen',          icon: ChartBarIcon },
    { key: 'ventasPeriodo',     label: 'Ventas x Período', icon: CalendarDaysIcon },
    { key: 'ventasCliente',     label: 'Ventas x Cliente', icon: UserGroupIcon },
    { key: 'productosVendidos', label: 'Top Productos',    icon: CubeIcon },
    { key: 'ventasMetodo',      label: 'Métodos de Pago',  icon: CreditCardIcon },
    { key: 'comprasProveedor',  label: 'Compras x Prov.',  icon: TruckIcon },
    { key: 'inventario',        label: 'Inventario',       icon: ShoppingCartIcon },
    { key: 'rentabilidad',      label: 'Rentabilidad',     icon: ArrowTrendingUpIcon },
    { key: 'cartera',           label: 'Cartera',          icon: BanknotesIcon },
    { key: 'tributario',        label: 'Tributario',       icon: DocumentTextIcon },
];

const COLORS = ['#6366f1','#10b981','#f43f5e','#f59e0b','#0ea5e9','#8b5cf6','#ec4899','#14b8a6','#f97316','#64748b'];

const PAL = { primary:'#6366f1', success:'#10b981', danger:'#f43f5e', warning:'#f59e0b', info:'#0ea5e9' } as const;

// ─── Formatters ───────────────────────────────────────────────────────────────

const fCOP   = (v: number) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(v||0);
const fShort = (v: number) => {
    if (v>=1e9) return `$${(v/1e9).toFixed(1)}B`;
    if (v>=1e6) return `$${(v/1e6).toFixed(1)}M`;
    if (v>=1e3) return `$${(v/1e3).toFixed(0)}K`;
    return `$${v}`;
};
const fPct = (v: number) => `${(v||0).toFixed(1)}%`;

// ─── Pie label (uses PieLabelRenderProps correctly) ───────────────────────────

const renderPieLabel = (p: PieLabelRenderProps): string =>
    `${p.name ?? ''} ${((p.percent ?? 0)*100).toFixed(0)}%`;

const renderPiePct = (p: PieLabelRenderProps): string =>
    `${((p.percent ?? 0)*100).toFixed(0)}%`;

// ─── Tooltip helpers ──────────────────────────────────────────────────────────
// recharts `content` prop accepts `(props: unknown) => ReactNode`.
// We cast our typed functions to `never` to satisfy the overload without fighting generics.

type TooltipContent = (args: TArgs) => React.ReactElement | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tt = (fn: TooltipContent): any => fn;

function ChartTooltip({ active, payload, label }: TArgs): React.ReactElement | null {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background:'rgba(10,10,25,0.96)',
            border:'1px solid rgba(99,102,241,0.35)',
            borderRadius:12, padding:'10px 14px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
        }}>
            {label !== undefined && (
                <p style={{color:'#94a3b8',fontSize:11,fontWeight:600,marginBottom:6,letterSpacing:'0.04em'}}>
                    {String(label)}
                </p>
            )}
            {payload.map((p, i) => {
                const val = p.value;
                const display = typeof val === 'number' && val > 1000 ? fCOP(val) : String(val ?? '');
                return (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:(p.color ?? p.fill ?? '#6366f1') as string}} />
                        <span style={{color:'#cbd5e1',fontSize:12}}>{String(p.name ?? '')}: </span>
                        <span style={{color:'#fff',fontSize:12,fontWeight:700}}>{display}</span>
                    </div>
                );
            })}
        </div>
    );
}

function ScatterTooltip({ active, payload }: TArgs): React.ReactElement | null {
    if (!active || !payload?.length) return null;
    const pt = payload[0].payload as RentItem | undefined;
    if (!pt) return null;
    return (
        <div style={{
            background:'rgba(10,10,25,0.96)',
            border:'1px solid rgba(99,102,241,0.35)',
            borderRadius:12, padding:'12px 16px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.35)',
        }}>
            <p style={{color:'#fff',fontSize:13,fontWeight:700,marginBottom:6}}>{pt.producto}</p>
            <p style={{color:'#94a3b8',fontSize:11}}>💰 Ingresos: <strong style={{color:'#10b981'}}>{fCOP(pt.ingresos)}</strong></p>
            <p style={{color:'#94a3b8',fontSize:11}}>📊 Margen: <strong style={{color:'#6366f1'}}>{fPct(pt.margen)}</strong></p>
            {pt.cantidadVendida !== undefined && (
                <p style={{color:'#94a3b8',fontSize:11}}>📦 Uds.: <strong style={{color:'#f59e0b'}}>{pt.cantidadVendida}</strong></p>
            )}
        </div>
    );
}

// ─── SVG Gradients ────────────────────────────────────────────────────────────

function GradDefs() {
    return (
        <defs>
            {[
                ['g0','#6366f1','#818cf8'],['g1','#10b981','#34d399'],
                ['g2','#f43f5e','#fb7185'],['g3','#f59e0b','#fbbf24'],
                ['g4','#0ea5e9','#38bdf8'],['g5','#8b5cf6','#a78bfa'],
            ].map(([id,a,b]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={a} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={b} stopOpacity={0.65}/>
                </linearGradient>
            ))}
            <linearGradient id="af0" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.22}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="af1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="af2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="af3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
        </defs>
    );
}

// ─── Treemap Cell ─────────────────────────────────────────────────────────────

interface TCellProps {
    x?: number; y?: number; width?: number; height?: number;
    name?: string; value?: number; index?: number;
    // recharts injects extra props — absorb them
    [key: string]: unknown;
}
function TreeCell({ x=0, y=0, width=0, height=0, name='', value=0, index=0 }: TCellProps) {
    const color = COLORS[index % COLORS.length];
    const hasRoom = width > 55 && height > 38;
    const hasRoom2 = width > 55 && height > 58;
    return (
        <g>
            <rect x={x+1} y={y+1} width={Math.max(0,width-2)} height={Math.max(0,height-2)} rx={8} fill={color} fillOpacity={0.88}/>
            <rect x={x+1} y={y+1} width={Math.max(0,width-2)} height={Math.min(32,height-2)} rx={8} fill="rgba(255,255,255,0.08)"/>
            {hasRoom && (
                <text x={x+10} y={y+22} fill="#fff" fontSize={11} fontWeight={700} style={{pointerEvents:'none'}}>
                    {name.length>15 ? `${name.slice(0,15)}…` : name}
                </text>
            )}
            {hasRoom2 && (
                <text x={x+10} y={y+38} fill="rgba(255,255,255,0.7)" fontSize={10} style={{pointerEvents:'none'}}>
                    {fShort(value)}
                </text>
            )}
        </g>
    );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color=PAL.primary, icon:Icon, trend }: KpiCardProps) {
    return (
        <div style={{
            background:'#fff', borderRadius:16, padding:'20px 22px',
            boxShadow:'0 1px 3px rgba(0,0,0,0.06),0 4px 20px rgba(0,0,0,0.05)',
            border:'1px solid rgba(0,0,0,0.05)', position:'relative', overflow:'hidden',
        }}>
            {/* Top accent bar */}
            <div style={{
                position:'absolute',top:0,left:0,right:0,height:3,
                background:`linear-gradient(90deg,${color},${color}44)`,
                borderRadius:'16px 16px 0 0',
            }}/>
            {/* Subtle bg glow */}
            <div style={{
                position:'absolute',bottom:-20,right:-20,width:80,height:80,borderRadius:'50%',
                background:`${color}0a`,
            }}/>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'relative'}}>
                <div style={{flex:1}}>
                    <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>
                        {label}
                    </p>
                    <p style={{fontSize:24,fontWeight:800,color:'#0f172a',letterSpacing:'-0.025em',lineHeight:1}}>
                        {value}
                    </p>
                    {sub && <p style={{fontSize:11,color:'#94a3b8',marginTop:8}}>{sub}</p>}
                    {trend && (
                        <div style={{marginTop:8,display:'flex',alignItems:'center',gap:4}}>
                            <span style={{
                                fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:6,
                                background: trend==='up'?'#f0fdf4':trend==='down'?'#fef2f2':'#f8fafc',
                                color: trend==='up'?'#16a34a':trend==='down'?'#ef4444':'#64748b',
                            }}>
                                {trend==='up'?'▲ al alza':trend==='down'?'▼ a la baja':'— estable'}
                            </span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div style={{
                        width:44,height:44,borderRadius:14,
                        background:`linear-gradient(135deg,${color}22,${color}0a)`,
                        border:`1px solid ${color}22`,
                        display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                    }}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: ChartCardProps) {
    return (
        <div style={{
            background:'#fff', borderRadius:16, padding:'22px 22px 18px',
            boxShadow:'0 1px 3px rgba(0,0,0,0.06),0 4px 20px rgba(0,0,0,0.05)',
            border:'1px solid rgba(0,0,0,0.05)',
        }}>
            <div style={{marginBottom:18}}>
                <p style={{fontSize:14,fontWeight:700,color:'#0f172a',letterSpacing:'-0.01em'}}>{title}</p>
                {subtitle && <p style={{fontSize:11,color:'#94a3b8',marginTop:3}}>{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

// ─── Data Table ───────────────────────────────────────────────────────────────

function DataTable({ headers, rows, emptyMsg='Sin datos' }: DataTableProps) {
    return (
        <div style={{
            background:'#fff',borderRadius:16,overflow:'hidden',
            boxShadow:'0 1px 3px rgba(0,0,0,0.06),0 4px 20px rgba(0,0,0,0.05)',
            border:'1px solid rgba(0,0,0,0.05)',
        }}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                <tr style={{background:'linear-gradient(180deg,#f8fafc,#f1f5f9)',borderBottom:'1px solid #e2e8f0'}}>
                    {headers.map((h,i) => (
                        <th key={i} style={{
                            textAlign:h.align??'left',fontSize:10,fontWeight:700,
                            color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',
                            padding:'12px 18px',
                        }}>
                            {h.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {rows.length===0 ? (
                    <tr><td colSpan={headers.length} style={{textAlign:'center',padding:'44px 16px',color:'#94a3b8',fontSize:13}}>
                        {emptyMsg}
                    </td></tr>
                ) : rows.map((row,ri) => (
                    <tr key={ri} style={{borderBottom:'1px solid #f1f5f9',transition:'background 0.1s'}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLTableRowElement).style.background='#fafafa';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLTableRowElement).style.background='transparent';}}
                    >
                        {row.map((cell,ci) => (
                            <td key={ci} style={{padding:'11px 18px',textAlign:headers[ci]?.align??'left',fontSize:13,color:'#0f172a'}}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

function Rank({ n }: { n: number }) {
    const m: Record<number,{bg:string;color:string}> = {
        1:{bg:'#fef9c3',color:'#854d0e'},
        2:{bg:'#f1f5f9',color:'#475569'},
        3:{bg:'#fef3e2',color:'#92400e'},
    };
    const {bg,color} = m[n] ?? {bg:'#f1f5f9',color:'#64748b'};
    return (
        <span style={{display:'inline-flex',alignItems:'center',justifyContent:'center',
            width:26,height:26,borderRadius:'50%',background:bg,color,fontSize:11,fontWeight:800}}>
            {n}
        </span>
    );
}

function Badge({ label, type }: BadgeProps) {
    const m: Record<BadgeProps['type'],{bg:string;color:string}> = {
        danger: {bg:'#fef2f2',color:'#ef4444'}, warning:{bg:'#fffbeb',color:'#d97706'},
        success:{bg:'#f0fdf4',color:'#16a34a'}, neutral:{bg:'#f8fafc',color:'#64748b'},
    };
    const {bg,color} = m[type];
    return (
        <span style={{display:'inline-block',padding:'3px 9px',borderRadius:6,
            background:bg,color,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>
            {label}
        </span>
    );
}

// ─── Aging Builder ────────────────────────────────────────────────────────────

function buildAging(cobrar: CarteraItem[], pagar: CarteraItem[]): AgingItem[] {
    const rangos = ['0–30 días','31–60 días','61–90 días','+90 días'];
    const now = new Date();
    const bucket = (f:string) => {
        const d = Math.floor((now.getTime()-new Date(f).getTime())/86_400_000);
        return d<=30?0:d<=60?1:d<=90?2:3;
    };
    const r: AgingItem[] = rangos.map(rango=>({rango,cobrar:0,pagar:0}));
    (cobrar??[]).forEach(c=>{if(c.vencimiento) r[bucket(c.vencimiento)].cobrar+=c.saldo;});
    (pagar ??[]).forEach(p=>{if(p.vencimiento) r[bucket(p.vencimiento)].pagar +=p.saldo;});
    return r;
}

// ─── Shared axis/chart props ──────────────────────────────────────────────────

const TK  = {fontSize:11,fill:'#94a3b8'} as const;
const AX  = {axisLine:false as const,tickLine:false as const};
const CG  = <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>;
const CGH = <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>;

// ─── Donut helper ─────────────────────────────────────────────────────────────

function DonutChart({ data, colors, label }: {
    data: {name:string;value:number}[];
    colors?: string[];
    label?: (p: PieLabelRenderProps) => string;
}) {
    const cls = colors ?? COLORS;
    return (
        <PieChart>
            <Pie
                data={data} cx="50%" cy="50%"
                outerRadius={108} innerRadius={52}
                paddingAngle={3} dataKey="value"
                label={label ?? renderPieLabel}
                labelLine={{stroke:'#cbd5e1',strokeWidth:1}}
            >
                {data.map((_,i) => <Cell key={i} fill={cls[i%cls.length]}/>)}
            </Pie>
            <Tooltip content={tt(ChartTooltip)}/>
        </PieChart>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
//  Main page
// ═════════════════════════════════════════════════════════════════════════════

export default function ReportesPage() {
    const [tab,setTab]         = useState<TabKey>('resumen');
    const [loading,setLoading] = useState(false);
    const [data,setData]       = useState<Record<string,unknown>>({});

    const hoy=new Date(), h30=new Date(hoy);
    h30.setDate(h30.getDate()-30);
    const [desde,setDesde] = useState(h30.toISOString().split('T')[0]);
    const [hasta,setHasta] = useState(hoy.toISOString().split('T')[0]);

    useEffect(()=>{void loadTab(tab);},[tab]);

    const loadTab = async (t:TabKey): Promise<void> => {
        if(data[t] && t!=='ventasPeriodo') return;
        setLoading(true);
        try {
            const ep: Record<TabKey,string> = {
                resumen:           '/erp/reportes/resumen',
                ventasPeriodo:     `/erp/reportes/ventas-periodo?desde=${desde}&hasta=${hasta}`,
                ventasCliente:     '/erp/reportes/ventas-cliente',
                productosVendidos: '/erp/reportes/productos-vendidos',
                ventasMetodo:      '/erp/reportes/ventas-metodo-pago',
                comprasProveedor:  '/erp/reportes/compras-proveedor',
                inventario:        '/erp/reportes/inventario',
                rentabilidad:      '/erp/reportes/rentabilidad',
                cartera:           '/erp/reportes/cartera',
                tributario:        '/erp/reportes/tributario',
            };
            const res = await api.get(ep[t]);
            setData(prev=>({...prev,[t]:(res?.data?.data??{}) as unknown}));
        } catch { toast.error('Error cargando reporte'); }
        finally  { setLoading(false); }
    };

    const d   = (data[tab]??{}) as Record<string,unknown>;
    const arr = <T,>(k:string): T[] => (d[k] as T[]|undefined)??[];
    const num = (k:string): number  => (d[k] as number|undefined)??0;
    const str = (k:string): string  => String((d[k] as string|number|undefined)??0);

    return (
        <div style={{fontFamily:'system-ui,sans-serif'}}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Header */}
            <div style={{marginBottom:28}}>
                <h1 style={{fontSize:22,fontWeight:800,color:'#0f172a',letterSpacing:'-0.025em'}}>Reportes</h1>
                <p style={{fontSize:12,color:'#94a3b8',marginTop:3}}>Análisis completo del negocio</p>
            </div>

            {/* Tabs */}
            <div style={{marginBottom:24,overflowX:'auto',paddingBottom:4}}>
                <div style={{display:'flex',gap:3,background:'#f1f5f9',padding:4,borderRadius:14,width:'fit-content',minWidth:'100%'}}>
                    {tabsList.map(t=>{
                        const active=tab===t.key;
                        return (
                            <button key={t.key} onClick={()=>setTab(t.key)} style={{
                                display:'flex',alignItems:'center',gap:6,
                                padding:'7px 13px',borderRadius:10,
                                fontSize:11,fontWeight:600,whiteSpace:'nowrap',
                                border:'none',cursor:'pointer',transition:'all 0.15s',
                                background:active?'#fff':'transparent',
                                color:active?'#0f172a':'#94a3b8',
                                boxShadow:active?'0 1px 4px rgba(0,0,0,0.1)':'none',
                            }}>
                                <t.icon className="w-3.5 h-3.5"/>
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'80px 0'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid #e2e8f0',borderTopColor:'#6366f1',animation:'spin 0.7s linear infinite'}}/>
                    <p style={{color:'#94a3b8',fontSize:13,marginTop:12}}>Cargando reporte...</p>
                </div>
            ) : (
                <div style={{display:'flex',flexDirection:'column',gap:20}}>

                    {/* ══ RESUMEN ═════════════════════════════════════════════════ */}
                    {tab==='resumen' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
                                <KpiCard label="Total Ventas"   value={fCOP(num('totalVentas'))}  sub={`${str('cantidadVentas')} ventas`}   color={PAL.success} icon={ArrowTrendingUpIcon}/>
                                <KpiCard label="Total Compras"  value={fCOP(num('totalCompras'))} sub={`${str('cantidadCompras')} compras`}  color={PAL.danger}  icon={ShoppingCartIcon}/>
                                <KpiCard label="Margen Bruto"   value={fCOP(num('margenBruto'))}  color={num('margenBruto')>=0?PAL.primary:PAL.danger} icon={ChartBarIcon}/>
                                <KpiCard label="Facturas DIAN"  value={str('ventasFacturadas')}   sub={`${str('productosActivos')} prod · ${str('clientesActivos')} clientes`} color={PAL.warning} icon={DocumentTextIcon}/>
                            </div>

                            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
                                <ChartCard title="Tendencia mensual" subtitle="Evolución comparada de ventas y compras en el año">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={arr<TendItem>('tendenciaMensual')}>
                                            <GradDefs/>
                                            {CG}
                                            <XAxis dataKey="mes" tick={TK} {...AX}/>
                                            <YAxis tickFormatter={fShort} tick={TK} {...AX}/>
                                            <Tooltip content={tt(ChartTooltip)}/>
                                            <Legend wrapperStyle={{fontSize:11}}/>
                                            <Area type="monotone" dataKey="ventas"  name="Ventas"  stroke={PAL.success} strokeWidth={2.5} fill="url(#af1)" dot={false} activeDot={{r:5,strokeWidth:0}}/>
                                            <Area type="monotone" dataKey="compras" name="Compras" stroke={PAL.danger}  strokeWidth={2}   fill="url(#af2)" dot={false} activeDot={{r:5,strokeWidth:0}}/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Ventas vs Compras" subtitle="Distribución proporcional">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <DonutChart
                                            data={[{name:'Ventas',value:num('totalVentas')},{name:'Compras',value:num('totalCompras')}]}
                                            colors={[PAL.success,PAL.danger]}
                                        />
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>
                        </>
                    )}

                    {/* ══ VENTAS POR PERÍODO ══════════════════════════════════════ */}
                    {tab==='ventasPeriodo' && (
                        <>
                            <div style={{
                                background:'#fff',borderRadius:16,padding:'18px 22px',
                                boxShadow:'0 1px 3px rgba(0,0,0,0.06)',border:'1px solid rgba(0,0,0,0.05)',
                                display:'flex',alignItems:'flex-end',gap:14,flexWrap:'wrap',
                            }}>
                                {(['Desde','Hasta'] as const).map((lbl,i)=>(
                                    <div key={lbl}>
                                        <label style={{display:'block',fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6}}>{lbl}</label>
                                        <input type="date" value={i===0?desde:hasta} onChange={e=>i===0?setDesde(e.target.value):setHasta(e.target.value)}
                                               style={{padding:'9px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',fontSize:13,color:'#0f172a',outline:'none'}}/>
                                    </div>
                                ))}
                                <button onClick={()=>{
                                    setData(prev=>{const n={...prev};delete n['ventasPeriodo'];return n;});
                                    void loadTab('ventasPeriodo');
                                }} style={{
                                    padding:'9px 22px',borderRadius:10,border:'none',
                                    background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',
                                    boxShadow:'0 2px 8px rgba(99,102,241,0.3)',
                                }}>Consultar</button>
                            </div>

                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                                <KpiCard label="Total del Período" value={fCOP(num('totalPeriodo'))}  color={PAL.primary} icon={BanknotesIcon}/>
                                <KpiCard label="Ventas Realizadas" value={str('cantidadVentas')}      color={PAL.success} icon={ChartBarIcon}/>
                            </div>

                            {arr<DetalleItem>('detalle').length>0 && (
                                <>
                                    <ChartCard title="Tendencia de Ventas" subtitle="Evolución diaria — hover para ver detalle">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={arr<DetalleItem>('detalle')}>
                                                <GradDefs/>
                                                {CG}
                                                <XAxis dataKey="fecha" tick={{fontSize:10,fill:'#94a3b8'}} angle={-35} textAnchor="end" height={55} {...AX}/>
                                                <YAxis tickFormatter={fShort} tick={TK} {...AX}/>
                                                <Tooltip content={tt(ChartTooltip)}/>
                                                <Area type="monotone" dataKey="total" name="Total" stroke={PAL.primary} strokeWidth={2.5} fill="url(#af0)"
                                                      dot={{fill:PAL.primary,r:3,strokeWidth:0}} activeDot={{r:6,strokeWidth:0,fill:PAL.primary}}/>
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <DataTable
                                        headers={[{label:'Fecha'},{label:'Ventas',align:'center'},{label:'Total',align:'right'}]}
                                        rows={arr<DetalleItem>('detalle').map(item=>[
                                            <span style={{fontWeight:600}}>{item.fecha}</span>,
                                            <span style={{color:'#64748b'}}>{item.cantidad}</span>,
                                            <span style={{fontWeight:700,color:PAL.primary}}>{fCOP(item.total)}</span>,
                                        ])}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {/* ══ VENTAS POR CLIENTE ══════════════════════════════════════ */}
                    {tab==='ventasCliente' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1.6fr',gap:16}}>
                                <ChartCard title="Participación" subtitle="% del total por cliente">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <DonutChart
                                            data={arr<ClienteItem>('topClientes').map(c=>({name:c.cliente,value:c.total}))}
                                            label={renderPiePct}
                                        />
                                    </ResponsiveContainer>
                                    <div style={{display:'flex',flexWrap:'wrap',gap:'6px 14px',marginTop:10}}>
                                        {arr<ClienteItem>('topClientes').map((c,i)=>(
                                            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
                                                <div style={{width:8,height:8,borderRadius:'50%',background:COLORS[i%COLORS.length]}}/>
                                                <span style={{fontSize:11,color:'#64748b'}}>{c.cliente}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>

                                <ChartCard title="Top Clientes" subtitle="Monto total acumulado — barras ordenadas">
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={arr<ClienteItem>('topClientes')} layout="vertical" barSize={20}>
                                            <GradDefs/>
                                            {CGH}
                                            <XAxis type="number" tickFormatter={fShort} tick={TK} {...AX}/>
                                            <YAxis type="category" dataKey="cliente" width={140} tick={{fontSize:11,fill:'#64748b'}} {...AX}/>
                                            <Tooltip content={tt(ChartTooltip)} cursor={{fill:'rgba(99,102,241,0.05)'}}/>
                                            <ReBar dataKey="total" name="Total" radius={[0,8,8,0]}>
                                                {arr<ClienteItem>('topClientes').map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                                            </ReBar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            <DataTable
                                headers={[{label:'#'},{label:'Cliente'},{label:'Compras',align:'center'},{label:'Total',align:'right'}]}
                                rows={arr<ClienteItem>('topClientes').map((item,i)=>[
                                    <Rank n={i+1}/>,
                                    <span style={{fontWeight:600}}>{item.cliente}</span>,
                                    <span style={{color:'#64748b'}}>{item.cantidad}</span>,
                                    <span style={{fontWeight:700}}>{fCOP(item.total)}</span>,
                                ])}
                                emptyMsg="No hay datos de clientes"
                            />
                        </>
                    )}

                    {/* ══ TOP PRODUCTOS — Treemap + barras ════════════════════════ */}
                    {tab==='productosVendidos' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:16}}>
                                <ChartCard title="Mapa de Ingresos" subtitle="Cada bloque = un producto · tamaño = ingreso generado · hover para detalle">
                                    <ResponsiveContainer width="100%" height={360}>
                                        <Treemap
                                            data={arr<ProductoItem>('topProductos').map((p): TreeNode=>({name:p.producto,value:p.ingresos}))}
                                            dataKey="value"
                                            content={<TreeCell/>}
                                        >
                                            <Tooltip content={tt(ChartTooltip)}/>
                                        </Treemap>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Unidades Vendidas" subtitle="Volumen de ventas por producto">
                                    <ResponsiveContainer width="100%" height={360}>
                                        <BarChart data={arr<ProductoItem>('topProductos')} layout="vertical" barSize={17}>
                                            <GradDefs/>
                                            {CGH}
                                            <XAxis type="number" tick={TK} {...AX}/>
                                            <YAxis type="category" dataKey="producto" width={130} tick={{fontSize:10,fill:'#64748b'}} {...AX}/>
                                            <Tooltip content={tt(ChartTooltip)} cursor={{fill:'rgba(99,102,241,0.04)'}}/>
                                            <ReBar dataKey="cantidadVendida" name="Uds." fill="url(#g0)" radius={[0,6,6,0]}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            <DataTable
                                headers={[{label:'#'},{label:'Producto'},{label:'Uds.',align:'center'},{label:'Ingresos',align:'right'}]}
                                rows={arr<ProductoItem>('topProductos').map((item,i)=>[
                                    <Rank n={i+1}/>,
                                    <span style={{fontWeight:600}}>{item.producto}</span>,
                                    <span style={{color:'#64748b'}}>{item.cantidadVendida}</span>,
                                    <span style={{fontWeight:700,color:PAL.success}}>{fCOP(item.ingresos)}</span>,
                                ])}
                                emptyMsg="No hay datos"
                            />
                        </>
                    )}

                    {/* ══ MÉTODOS DE PAGO ═════════════════════════════════════════ */}
                    {tab==='ventasMetodo' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                                <ChartCard title="Participación por Método" subtitle="% del monto total transaccionado">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <DonutChart data={arr<MetodoItem>('metodosPago').map(m=>({name:m.metodo,value:m.total}))}/>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Monto por Canal" subtitle="Total COP por método de pago">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={arr<MetodoItem>('metodosPago')} barSize={44}>
                                            <GradDefs/>
                                            {CG}
                                            <XAxis dataKey="metodo" tick={TK} {...AX}/>
                                            <YAxis tickFormatter={fShort} tick={TK} {...AX}/>
                                            <Tooltip content={tt(ChartTooltip)} cursor={{fill:'rgba(0,0,0,0.03)'}}/>
                                            <ReBar dataKey="total" name="Total" radius={[8,8,0,0]}>
                                                {arr<MetodoItem>('metodosPago').map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                                            </ReBar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            <DataTable
                                headers={[{label:'Método'},{label:'Transacciones',align:'center'},{label:'Total',align:'right'}]}
                                rows={arr<MetodoItem>('metodosPago').map((item,i)=>[
                                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                                        <div style={{width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length]}}/>
                                        <span style={{fontWeight:600}}>{item.metodo}</span>
                                    </div>,
                                    <span style={{color:'#64748b'}}>{item.cantidad}</span>,
                                    <span style={{fontWeight:700}}>{fCOP(item.total)}</span>,
                                ])}
                            />
                        </>
                    )}

                    {/* ══ COMPRAS POR PROVEEDOR ═══════════════════════════════════ */}
                    {tab==='comprasProveedor' && (
                        <>
                            <ChartCard title="Compras por Proveedor" subtitle="Ranking por monto total invertido">
                                <ResponsiveContainer width="100%" height={340}>
                                    <BarChart data={arr<ProveedorItem>('comprasProveedor')} layout="vertical" barSize={22}>
                                        <GradDefs/>
                                        {CGH}
                                        <XAxis type="number" tickFormatter={fShort} tick={TK} {...AX}/>
                                        <YAxis type="category" dataKey="proveedor" width={160} tick={{fontSize:11,fill:'#64748b'}} {...AX}/>
                                        <Tooltip content={tt(ChartTooltip)} cursor={{fill:'rgba(244,63,94,0.04)'}}/>
                                        <ReBar dataKey="total" name="Total" fill="url(#g2)" radius={[0,8,8,0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <DataTable
                                headers={[{label:'Proveedor'},{label:'Compras',align:'center'},{label:'Total',align:'right'}]}
                                rows={arr<ProveedorItem>('comprasProveedor').map(item=>[
                                    <span style={{fontWeight:600}}>{item.proveedor}</span>,
                                    <span style={{color:'#64748b'}}>{item.cantidad}</span>,
                                    <span style={{fontWeight:700,color:PAL.danger}}>{fCOP(item.total)}</span>,
                                ])}
                                emptyMsg="No hay datos de compras"
                            />
                        </>
                    )}

                    {/* ══ INVENTARIO ══════════════════════════════════════════════ */}
                    {tab==='inventario' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                                <KpiCard label="Valor Inventario"    value={fCOP(num('valorTotalInventario'))} color={PAL.primary} icon={CubeIcon}/>
                                <KpiCard label="Productos Activos"   value={str('totalProductos')}             color={PAL.success} icon={ShoppingCartIcon}/>
                                <KpiCard label="Stock Bajo/Agotado"  value={str('cantidadStockBajo')}          color={PAL.danger}  icon={TruckIcon}/>
                            </div>

                            <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:16}}>
                                <ChartCard title="Capital Inmovilizado" subtitle="Cada bloque = dinero atrapado en ese producto — más grande = más capital">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <Treemap
                                            data={arr<InvItem>('productos').map((p): TreeNode=>({name:p.nombre,value:p.valorizado}))}
                                            dataKey="value"
                                            content={<TreeCell/>}
                                        >
                                            <Tooltip content={tt(ChartTooltip)}/>
                                        </Treemap>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Alertas de Stock" subtitle="Rojo = bajo mínimo · Índigo = saludable">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={arr<InvItem>('productos').slice(0,12)} barSize={20}>
                                            <GradDefs/>
                                            {CG}
                                            <XAxis dataKey="nombre" tick={{fontSize:9,fill:'#94a3b8'}} angle={-30} textAnchor="end" height={65} {...AX}/>
                                            <YAxis tick={TK} {...AX}/>
                                            <Tooltip content={tt(ChartTooltip)} cursor={{fill:'rgba(0,0,0,0.03)'}}/>
                                            <ReBar dataKey="stock" name="Stock" radius={[5,5,0,0]}>
                                                {arr<InvItem>('productos').slice(0,12).map((p,i)=>(
                                                    <Cell key={i} fill={p.stock<=(p.stockMinimo??0)?PAL.danger:PAL.primary}/>
                                                ))}
                                            </ReBar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            {arr<InvItem>('productosStockBajo').length>0 && (
                                <>
                                    <p style={{fontSize:12,fontWeight:700,color:PAL.danger}}>⚠️ Requieren reabastecimiento</p>
                                    <DataTable
                                        headers={[{label:'Código'},{label:'Producto'},{label:'Stock',align:'center'},{label:'Mínimo',align:'center'}]}
                                        rows={arr<InvItem>('productosStockBajo').map(p=>[
                                            <span style={{fontSize:11,fontFamily:'monospace',color:'#64748b'}}>{p.codigo}</span>,
                                            <span style={{fontWeight:600}}>{p.nombre}</span>,
                                            <Badge label={String(p.stock)} type={p.stock===0?'danger':'warning'}/>,
                                            <span style={{color:'#64748b'}}>{p.stockMinimo??0}</span>,
                                        ])}
                                    />
                                </>
                            )}

                            <DataTable
                                headers={[{label:'Código'},{label:'Producto'},{label:'Cat.'},{label:'Stock',align:'center'},{label:'Costo',align:'right'},{label:'Valorizado',align:'right'}]}
                                rows={arr<InvItem>('productos').map(p=>[
                                    <span style={{fontSize:11,fontFamily:'monospace',color:'#64748b'}}>{p.codigo}</span>,
                                    <span style={{fontWeight:600}}>{p.nombre}</span>,
                                    <span style={{color:'#64748b',fontSize:11}}>{p.categoria}</span>,
                                    <span style={{fontWeight:600}}>{p.stock}</span>,
                                    <span style={{color:'#64748b',fontSize:12}}>{fCOP(p.costo)}</span>,
                                    <span style={{fontWeight:700}}>{fCOP(p.valorizado)}</span>,
                                ])}
                            />
                        </>
                    )}

                    {/* ══ RENTABILIDAD ════════════════════════════════════════════ */}
                    {tab==='rentabilidad' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
                                <KpiCard label="Ingresos"     value={fCOP(num('totalIngresos'))} color={PAL.success}  icon={ArrowTrendingUpIcon}/>
                                <KpiCard label="Costos"       value={fCOP(num('totalCostos'))}   color={PAL.danger}   icon={ShoppingCartIcon}/>
                                <KpiCard label="Margen Bruto" value={fCOP(num('margenBruto'))}   color={num('margenBruto')>=0?PAL.primary:PAL.danger} icon={ChartBarIcon}/>
                                <KpiCard label="% Margen"     value={fPct(num('porcentajeMargen'))} color={num('porcentajeMargen')>=0?PAL.success:PAL.danger} icon={DocumentTextIcon}/>
                            </div>

                            <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:16}}>
                                <ChartCard title="Ingresos · Costos · Ganancia" subtitle="Barras = montos · Línea = ganancia neta por producto">
                                    <ResponsiveContainer width="100%" height={340}>
                                        <ComposedChart data={arr<RentItem>('rentabilidadProducto')}>
                                            <GradDefs/>
                                            {CG}
                                            <XAxis dataKey="producto" tick={{fontSize:9,fill:'#94a3b8'}} angle={-20} textAnchor="end" height={70} {...AX}/>
                                            <YAxis tickFormatter={fShort} tick={TK} {...AX}/>
                                            <Tooltip content={tt(ChartTooltip)} cursor={{fill:'rgba(0,0,0,0.03)'}}/>
                                            <Legend wrapperStyle={{fontSize:11}}/>
                                            <ReBar dataKey="ingresos" name="Ingresos" fill="url(#g1)" radius={[5,5,0,0]}/>
                                            <ReBar dataKey="costo"    name="Costo"    fill="url(#g2)" radius={[5,5,0,0]}/>
                                            <Line type="monotone" dataKey="ganancia" name="Ganancia" stroke={PAL.primary} strokeWidth={2.5} dot={{fill:PAL.primary,r:4,strokeWidth:0}} activeDot={{r:6,strokeWidth:0}}/>
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Margen % vs Ingresos" subtitle="Punto grande = más unidades · Ideal: arriba a la derecha →">
                                    <ResponsiveContainer width="100%" height={340}>
                                        <ScatterChart margin={{top:10,right:20,bottom:30,left:10}}>
                                            <GradDefs/>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                                            <XAxis type="number" dataKey="ingresos" name="Ingresos" tickFormatter={fShort} tick={TK} {...AX}
                                                   label={{value:'← Ingresos →',position:'insideBottom',offset:-8,style:{fontSize:10,fill:'#94a3b8'}}}/>
                                            <YAxis type="number" dataKey="margen" name="Margen %" tickFormatter={(v:number)=>`${v}%`} tick={TK} {...AX}
                                                   label={{value:'Margen %',angle:-90,position:'insideLeft',style:{fontSize:10,fill:'#94a3b8'}}}/>
                                            <ZAxis type="number" dataKey="cantidadVendida" range={[50,350]} name="Unidades"/>
                                            <Tooltip content={tt(ScatterTooltip)}/>
                                            <Scatter
                                                data={arr<RentItem>('rentabilidadProducto').map(p=>({
                                                    ...p, cantidadVendida:p.cantidadVendida??10,
                                                }))}
                                                fill={PAL.primary} fillOpacity={0.72}
                                            />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            <DataTable
                                headers={[{label:'Producto'},{label:'Ingresos',align:'right'},{label:'Costo',align:'right'},{label:'Ganancia',align:'right'},{label:'Margen',align:'right'}]}
                                rows={arr<RentItem>('rentabilidadProducto').map(item=>[
                                    <span style={{fontWeight:600}}>{item.producto}</span>,
                                    <span style={{color:'#64748b',fontSize:12}}>{fCOP(item.ingresos)}</span>,
                                    <span style={{color:'#64748b',fontSize:12}}>{fCOP(item.costo)}</span>,
                                    <span style={{fontWeight:700,color:item.ganancia>=0?PAL.success:PAL.danger}}>{fCOP(item.ganancia)}</span>,
                                    <Badge label={fPct(item.margen)} type={item.margen>=30?'success':item.margen>=0?'warning':'danger'}/>,
                                ])}
                                emptyMsg="No hay datos de rentabilidad"
                            />
                        </>
                    )}

                    {/* ══ CARTERA — Aging ═════════════════════════════════════════ */}
                    {tab==='cartera' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
                                <KpiCard label="Por Cobrar" value={fCOP(num('totalPorCobrar'))} color={PAL.success} icon={BanknotesIcon}/>
                                <KpiCard label="Por Pagar"  value={fCOP(num('totalPorPagar'))}  color={PAL.danger}  icon={CreditCardIcon}/>
                                <KpiCard label="Balance"    value={fCOP(num('balance'))}         color={num('balance')>=0?PAL.primary:PAL.danger} icon={ChartBarIcon}/>
                                <KpiCard label="Vencidas"   value={String(num('vencidasCobrar')+num('vencidasPagar'))} color={PAL.warning} icon={DocumentTextIcon}/>
                            </div>

                            <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:16}}>
                                <ChartCard title="Aging de Cartera" subtitle="Qué tan antiguas son las deudas — más tiempo = más riesgo de incobrabilidad">
                                    <ResponsiveContainer width="100%" height={290}>
                                        <BarChart data={buildAging(arr<CarteraItem>('detalleCobrar'),arr<CarteraItem>('detallePagar'))} barSize={30}>
                                            <GradDefs/>
                                            {CG}
                                            <XAxis dataKey="rango" tick={TK} {...AX}/>
                                            <YAxis tickFormatter={fShort} tick={TK} {...AX}/>
                                            <Tooltip content={tt(ChartTooltip)} cursor={{fill:'rgba(0,0,0,0.03)'}}/>
                                            <Legend wrapperStyle={{fontSize:11}}/>
                                            <ReBar dataKey="cobrar" name="Por Cobrar" fill="url(#g1)" radius={[6,6,0,0]}/>
                                            <ReBar dataKey="pagar"  name="Por Pagar"  fill="url(#g2)" radius={[6,6,0,0]}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                <ChartCard title="Distribución" subtitle="Por cobrar vs por pagar">
                                    <ResponsiveContainer width="100%" height={290}>
                                        <DonutChart
                                            data={[{name:'Por Cobrar',value:num('totalPorCobrar')},{name:'Por Pagar',value:num('totalPorPagar')}]}
                                            colors={[PAL.success,PAL.danger]}
                                        />
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            {arr<CarteraItem>('detalleCobrar').length>0 && (
                                <>
                                    <p style={{fontSize:12,fontWeight:700,color:'#0f172a'}}>Cuentas por Cobrar</p>
                                    <DataTable
                                        headers={[{label:'Cliente'},{label:'Monto',align:'right'},{label:'Saldo',align:'right'},{label:'Vencimiento'},{label:'Estado'}]}
                                        rows={arr<CarteraItem>('detalleCobrar').map(c=>[
                                            <span style={{fontWeight:600}}>{c.cliente}</span>,
                                            <span style={{color:'#64748b',fontSize:12}}>{fCOP(c.monto)}</span>,
                                            <span style={{fontWeight:700}}>{fCOP(c.saldo)}</span>,
                                            <span style={{fontSize:12,color:c.vencida?PAL.danger:'#64748b',fontWeight:c.vencida?700:400}}>{c.vencimiento}</span>,
                                            <Badge label={c.vencida?'VENCIDA':c.estado} type={c.vencida?'danger':'warning'}/>,
                                        ])}
                                    />
                                </>
                            )}

                            {arr<CarteraItem>('detallePagar').length>0 && (
                                <>
                                    <p style={{fontSize:12,fontWeight:700,color:'#0f172a'}}>Cuentas por Pagar</p>
                                    <DataTable
                                        headers={[{label:'Proveedor'},{label:'Monto',align:'right'},{label:'Saldo',align:'right'},{label:'Vencimiento'},{label:'Estado'}]}
                                        rows={arr<CarteraItem>('detallePagar').map(c=>[
                                            <span style={{fontWeight:600}}>{c.proveedor}</span>,
                                            <span style={{color:'#64748b',fontSize:12}}>{fCOP(c.monto)}</span>,
                                            <span style={{fontWeight:700}}>{fCOP(c.saldo)}</span>,
                                            <span style={{fontSize:12,color:c.vencida?PAL.danger:'#64748b',fontWeight:c.vencida?700:400}}>{c.vencimiento}</span>,
                                            <Badge label={c.vencida?'VENCIDA':c.estado} type={c.vencida?'danger':'warning'}/>,
                                        ])}
                                    />
                                </>
                            )}

                            {!arr<CarteraItem>('detalleCobrar').length && !arr<CarteraItem>('detallePagar').length && (
                                <div style={{textAlign:'center',padding:'44px 0',color:'#94a3b8',fontSize:13}}>No hay cuentas pendientes</div>
                            )}
                        </>
                    )}

                    {/* ══ TRIBUTARIO ══════════════════════════════════════════════ */}
                    {tab==='tributario' && (
                        <>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
                                <KpiCard label="Total Facturado"   value={fCOP(num('totalFacturado'))}  color={PAL.primary} icon={DocumentTextIcon}/>
                                <KpiCard label="Base Gravable"     value={fCOP(num('baseGravable'))}     color={PAL.info}    icon={ChartBarIcon}/>
                                <KpiCard label="IVA Generado"      value={fCOP(num('totalIva'))}         color={PAL.warning} icon={BanknotesIcon}/>
                                <KpiCard label="Facturas Emitidas" value={str('facturasEmitidas')}        color={PAL.success} icon={CreditCardIcon}/>
                            </div>

                            {arr<MesItem>('detallePorMes').length>0 && (
                                <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:16}}>
                                    <ChartCard title="Ventas e IVA por Mes" subtitle="Área apilada: base gravable + IVA = total facturado">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <AreaChart data={arr<MesItem>('detallePorMes')}>
                                                <GradDefs/>
                                                {CG}
                                                <XAxis dataKey="mes" tick={TK} {...AX}/>
                                                <YAxis tickFormatter={fShort} tick={TK} {...AX}/>
                                                <Tooltip content={tt(ChartTooltip)}/>
                                                <Legend wrapperStyle={{fontSize:11}}/>
                                                <Area type="monotone" dataKey="ventas" name="Ventas (base)" stackId="1" stroke={PAL.primary} strokeWidth={2} fill="url(#af0)"/>
                                                <Area type="monotone" dataKey="iva"    name="IVA"           stackId="1" stroke={PAL.warning} strokeWidth={2} fill="url(#af3)"/>
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartCard>

                                    <ChartCard title="Proporción IVA" subtitle="Cuánto del total facturado corresponde a impuestos">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <DonutChart
                                                data={[{name:'Base Gravable',value:num('baseGravable')},{name:'IVA',value:num('totalIva')}]}
                                                colors={[PAL.primary,PAL.warning]}
                                            />
                                        </ResponsiveContainer>
                                    </ChartCard>
                                </div>
                            )}

                            <DataTable
                                headers={[{label:'Mes'},{label:'Facturas',align:'center'},{label:'Ventas',align:'right'},{label:'IVA',align:'right'}]}
                                rows={arr<MesItem>('detallePorMes').map(item=>[
                                    <span style={{fontWeight:600}}>{item.mes}</span>,
                                    <span style={{color:'#64748b'}}>{item.cantidad}</span>,
                                    <span style={{color:'#64748b',fontSize:12}}>{fCOP(item.ventas)}</span>,
                                    <span style={{fontWeight:700,color:PAL.warning}}>{fCOP(item.iva)}</span>,
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