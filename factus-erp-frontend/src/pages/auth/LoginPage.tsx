import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/erp/auth/login', { username, password });
            const data = res.data.data;
            login({ token: data.token, username: data.username, nombreCompleto: data.nombreCompleto, rol: data.rol });
            toast.success('Bienvenido, ' + data.nombreCompleto);
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] bg-dark flex-col justify-between p-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]"
                     style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                </div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-secondary/20 rounded-full blur-[80px]"></div>

                <div className="relative z-10">

                </div>

                <div className="relative z-10">
                    <h2 className="text-[42px] font-extrabold text-white leading-[1.1] tracking-tight">
                        Tu negocio,<br/>
                        <span className="bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
              bajo control.
            </span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-5 leading-relaxed max-w-xs">
                        Gestiona ventas, inventario y genera facturas electrónicas DIAN desde un solo lugar.
                    </p>


                </div>

                <div className="relative z-10 flex items-center gap-4 text-[11px] text-gray-600">
                    <span>🇨🇴 Colombia</span>
                    <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                    <span>DIAN Certificado</span>
                    <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                    <span>Factus API</span>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-[380px] animate-fade-up">
                    <div className="lg:hidden flex items-center gap-2.5 mb-10">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-white text-sm font-extrabold">F</span>
                        </div>
                        <span className="text-base font-bold tracking-tight">Factus ERP</span>
                    </div>

                    <h1 className="text-[22px] font-bold text-dark tracking-tight">Bienvenido de vuelta</h1>
                    <p className="text-sm text-gray-400 mt-1.5 mb-8">Ingresa tus credenciales para acceder al sistema</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                                placeholder="Tu usuario"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Ingresando...
                </span>
                            ) : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
                        <p className="text-[11px] font-semibold text-primary mb-1">Credenciales de prueba</p>
                        <p className="text-[11px] text-gray-500 font-mono">admin · admin123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}