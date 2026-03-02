import { useEffect, useState } from 'react';
import api from '../../api/axios';
import type { Venta } from '../../types';
import toast from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
    CodeBracketIcon,
    QrCodeIcon,
} from '@heroicons/react/24/outline';

export default function FacturasPage() {
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [enviando, setEnviando] = useState<number | null>(null);
    const [descargando, setDescargando] = useState<string | null>(null);

    useEffect(() => { loadFacturas(); }, []);

    const loadFacturas = async () => {
        try {
            const res = await api.get('/erp/ventas');
            const todas = res.data.data || [];
            setVentas(todas.filter((v: Venta) => v.estado === 'FACTURADA'));
        } catch { toast.error('Error cargando facturas'); }
        finally { setLoading(false); }
    };

    const verPDF = async (numeroFactura: string) => {
        setDescargando(numeroFactura + '-pdf');
        try {
            const res = await api.get(`/invoices/${numeroFactura}/pdf`);
            const pdfBase64 = res.data.data?.data?.pdf_base_64_encoded || '';
            if (!pdfBase64) { toast.error('No se pudo obtener el PDF'); return; }

            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch {
            toast.error('Error descargando PDF');
        } finally {
            setDescargando(null);
        }
    };

    const descargarPDF = async (numeroFactura: string) => {
        setDescargando(numeroFactura + '-dpdf');
        try {
            const res = await api.get(`/invoices/${numeroFactura}/pdf`);
            const pdfBase64 = res.data.data?.data?.pdf_base_64_encoded || '';
            const fileName = res.data.data?.data?.file_name || `factura-${numeroFactura}.pdf`;
            if (!pdfBase64) { toast.error('No se pudo obtener el PDF'); return; }

            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            toast.success('PDF descargado');
        } catch {
            toast.error('Error descargando PDF');
        } finally {
            setDescargando(null);
        }
    };

    const descargarXML = async (numeroFactura: string) => {
        setDescargando(numeroFactura + '-xml');
        try {
            const res = await api.get(`/invoices/${numeroFactura}/xml`);
            const xmlBase64 = res.data.data?.data?.xml_base_64_encoded || '';
            const fileName = res.data.data?.data?.file_name || `factura-${numeroFactura}.xml`;
            if (!xmlBase64) { toast.error('No se pudo obtener el XML'); return; }

            const byteCharacters = atob(xmlBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/xml' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            toast.success('XML descargado');
        } catch {
            toast.error('Error descargando XML');
        } finally {
            setDescargando(null);
        }
    };

    const enviarEmail = async (ventaId: number, numeroFactura: string, clienteEmail: string) => {
        if (!clienteEmail) { toast.error('El cliente no tiene email'); return; }
        setEnviando(ventaId);
        try {
            await api.post(`/invoices/${numeroFactura}/send-email?email=${encodeURIComponent(clienteEmail)}`);
            toast.success('Factura enviada a ' + clienteEmail);
        } catch {
            toast.error('Error enviando email');
        } finally {
            setEnviando(null);
        }
    };

    const copiarCUFE = (cufe: string) => {
        if (!cufe) { toast.error('Esta factura no tiene CUFE'); return; }
        navigator.clipboard.writeText(cufe).then(() => {
            toast.success('CUFE copiado al portapapeles');
        }).catch(() => {
            toast.error('Error copiando CUFE');
        });
    };

    const filtered = ventas.filter(v =>
        v.numeroFactura?.toLowerCase().includes(search.toLowerCase()) ||
        v.numeroVenta?.toLowerCase().includes(search.toLowerCase()) ||
        v.cliente?.nombres?.toLowerCase().includes(search.toLowerCase())
    );

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    const totalFacturado = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
    const totalImpuestos = ventas.reduce((acc, v) => acc + (v.totalImpuestos || 0), 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-dark">Facturas DIAN</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{ventas.length} facturas electrónicas generadas</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Facturado</p>
                    <p className="text-lg font-bold text-dark mt-1">{formatCurrency(totalFacturado)}</p>
                </div>
                <div className="card p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Impuestos</p>
                    <p className="text-lg font-bold text-primary mt-1">{formatCurrency(totalImpuestos)}</p>
                </div>
                <div className="card p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Facturas Emitidas</p>
                    <p className="text-lg font-bold text-success mt-1">{ventas.length}</p>
                </div>
            </div>

            <div className="card p-4 mb-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número de factura, venta o cliente..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all" />
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/50">
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">N° Factura</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">N° Venta</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Cliente</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Subtotal</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">IVA</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Total</th>
                            <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Fecha</th>
                            <th className="text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">Cargando...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="text-center py-10 text-sm text-gray-400">No hay facturas generadas</td></tr>
                        ) : (
                            filtered.map((v, i) => (
                                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                                    <td className="px-5 py-3.5">
                                        <span className="text-sm font-semibold text-primary">{v.numeroFactura || '—'}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono text-gray-500">{v.numeroVenta}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                {v.cliente?.nombres?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <span className="text-sm font-semibold text-dark block">{v.cliente?.nombres}</span>
                                                <span className="text-[10px] text-gray-400">{v.cliente?.tipoIdentificacion} {v.cliente?.numeroIdentificacion}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-xs text-gray-500">{formatCurrency(v.subtotal)}</td>
                                    <td className="px-5 py-3.5 text-right text-xs text-gray-500">{formatCurrency(v.totalImpuestos)}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-sm font-semibold text-dark">{formatCurrency(v.total)}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-gray-500">
                                        {v.creadoEn ? new Date(v.creadoEn).toLocaleDateString('es-CO') : '—'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <button
                                                onClick={() => verPDF(v.numeroFactura)}
                                                disabled={!v.numeroFactura || descargando === v.numeroFactura + '-pdf'}
                                                className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary transition-colors disabled:opacity-30"
                                                title="Ver PDF"
                                            >
                                                <DocumentTextIcon className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => descargarPDF(v.numeroFactura)}
                                                disabled={!v.numeroFactura || descargando === v.numeroFactura + '-dpdf'}
                                                className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-30"
                                                title="Descargar PDF"
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => descargarXML(v.numeroFactura)}
                                                disabled={!v.numeroFactura || descargando === v.numeroFactura + '-xml'}
                                                className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-colors disabled:opacity-30"
                                                title="Descargar XML"
                                            >
                                                <CodeBracketIcon className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => enviarEmail(v.id, v.numeroFactura, v.cliente?.email || '')}
                                                disabled={!v.numeroFactura || enviando === v.id}
                                                className="p-1.5 rounded-lg hover:bg-success-50 text-gray-400 hover:text-success transition-colors disabled:opacity-30"
                                                title={`Enviar a ${v.cliente?.email || 'sin email'}`}
                                            >
                                                {enviando === v.id ? (
                                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                                ) : (
                                                    <EnvelopeIcon className="w-4 h-4" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => copiarCUFE(v.cufe)}
                                                disabled={!v.cufe}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-dark transition-colors disabled:opacity-30"
                                                title="Copiar CUFE"
                                            >
                                                <DocumentDuplicateIcon className="w-4 h-4" />
                                            </button>

                                            {v.factusQrUrl && (

                                                <a
                                                    href={v.factusQrUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                                                title="Verificar en DIAN"
                                                >
                                                <QrCodeIcon className="w-4 h-4" />
                                                </a>
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
        </div>
    );
}