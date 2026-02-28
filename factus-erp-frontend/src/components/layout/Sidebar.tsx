import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Squares2X2Icon,
    UserGroupIcon,
    CubeIcon,
    ShoppingCartIcon,
    TruckIcon,
    DocumentTextIcon,
    BuildingStorefrontIcon,
    TagIcon,
    ArrowRightStartOnRectangleIcon,
    Cog6ToothIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

const menu = [
    { label: 'GENERAL', items: [
            { name: 'Dashboard', path: '/', icon: Squares2X2Icon },
        ]},
    { label: 'DIRECTORIO', items: [
            { name: 'Clientes', path: '/clientes', icon: UserGroupIcon },
            { name: 'Proveedores', path: '/proveedores', icon: TruckIcon },
        ]},
    { label: 'INVENTARIO', items: [
            { name: 'Categorías', path: '/categorias', icon: TagIcon },
            { name: 'Productos', path: '/productos', icon: CubeIcon },
        ]},
    { label: 'OPERACIONES', items: [
            { name: 'Ventas', path: '/ventas', icon: ShoppingCartIcon },
            { name: 'Compras', path: '/compras', icon: BuildingStorefrontIcon },
        ]},
    { label: 'FACTURACIÓN', items: [
            { name: 'Facturas DIAN', path: '/facturas', icon: DocumentTextIcon },
            { name: 'Reportes', path: '/reportes', icon: ChartBarIcon },
        ]},
];

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="w-[260px] min-h-screen flex flex-col bg-sidebar">
            <div className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white text-sm font-extrabold">F</span>
                    </div>
                    <div>
                        <span className="text-white text-[15px] font-bold tracking-tight block">Factus ERP</span>
                        <span className="text-gray-600 text-[10px] tracking-widest uppercase">Colombia · DIAN</span>
                    </div>
                </div>
            </div>


            <div className="px-4 mb-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-light text-gray-500 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <span>Buscar...</span>
                    <span className="ml-auto text-[10px] text-gray-600 bg-dark-lighter px-1.5 py-0.5 rounded">⌘K</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-5">
                {menu.map((group) => (
                    <div key={group.label}>
                        <p className="text-[10px] font-bold text-gray-600 tracking-[0.15em] px-3 mb-2">{group.label}</p>
                        <div className="space-y-0.5">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                            isActive
                                                ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary-light'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-dark-light'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                isActive ? 'bg-primary/20 text-primary-light' : 'bg-dark-light text-gray-500 group-hover:text-gray-300'
                                            }`}>
                                                <item.icon className="w-[18px] h-[18px]" />
                                            </div>
                                            {item.name}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="px-4 py-4">
                <div className="bg-dark-light rounded-xl p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20">
                            {user?.nombreCompleto?.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm text-white font-semibold truncate">{user?.nombreCompleto}</p>
                            <p className="text-[10px] text-gray-500 tracking-wider uppercase">{user?.rol}</p>
                        </div>
                        <button className="p-1.5 rounded-lg hover:bg-dark-lighter transition-colors text-gray-600 hover:text-gray-400">
                            <Cog6ToothIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={logout}
                        className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-danger hover:bg-danger/10 border border-dark-lighter transition-all"
                    >
                        <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </aside>
    );
}