import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { BellIcon } from '@heroicons/react/24/outline';

export default function MainLayout() {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) return <Navigate to="/login" />;

    const getPageTitle = () => {
        const paths: Record<string, string> = {
            '/': 'Dashboard',
            '/clientes': 'Clientes',
            '/proveedores': 'Proveedores',
            '/categorias': 'Categorías',
            '/productos': 'Productos',
            '/ventas': 'Ventas',
            '/compras': 'Compras',
            '/facturas': 'Facturas DIAN',
            '/reportes': 'Reportes',
        };
        return paths[location.pathname] || 'Dashboard';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <div>
                        <h2 className="text-[15px] font-bold text-dark">{getPageTitle()}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <BellIcon className="w-5 h-5 text-gray-400" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-2.5 pl-4 border-l border-gray-200">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold">
                                {user?.nombreCompleto?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-dark">{user?.nombreCompleto}</p>
                                <p className="text-[10px] text-gray-400">{user?.rol}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-auto">
                    <div className="animate-fade-up">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}