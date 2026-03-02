import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
interface AuthUser {
    username: string;
    nombreCompleto: string;
    rol: string;
    token: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (data: AuthUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
    puede: (modulo: string, accion: 'ver' | 'crear' | 'editar' | 'eliminar') => boolean;
    modulosVisibles: () => string[];
}

const permisos: Record<string, Record<string, { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean }>> = {
    ADMIN: {
        dashboard: { ver: true, crear: true, editar: true, eliminar: true },
        clientes: { ver: true, crear: true, editar: true, eliminar: true },
        proveedores: { ver: true, crear: true, editar: true, eliminar: true },
        categorias: { ver: true, crear: true, editar: true, eliminar: true },
        productos: { ver: true, crear: true, editar: true, eliminar: true },
        ventas: { ver: true, crear: true, editar: true, eliminar: true },
        compras: { ver: true, crear: true, editar: true, eliminar: true },
        facturas: { ver: true, crear: true, editar: true, eliminar: true },
        cuentas: { ver: true, crear: true, editar: true, eliminar: true },
        reportes: { ver: true, crear: true, editar: true, eliminar: true },
        usuarios: { ver: true, crear: true, editar: true, eliminar: true },
    },
    VENDEDOR: {
        dashboard: { ver: true, crear: false, editar: false, eliminar: false },
        clientes: { ver: true, crear: true, editar: true, eliminar: false },
        productos: { ver: true, crear: false, editar: false, eliminar: false },
        categorias: { ver: true, crear: false, editar: false, eliminar: false },
        ventas: { ver: true, crear: true, editar: true, eliminar: false },
        facturas: { ver: true, crear: false, editar: false, eliminar: false },
        reportes: { ver: true, crear: false, editar: false, eliminar: false },
    },
    CONTADOR: {
        dashboard: { ver: true, crear: false, editar: false, eliminar: false },
        clientes: { ver: true, crear: false, editar: false, eliminar: false },
        proveedores: { ver: true, crear: false, editar: false, eliminar: false },
        ventas: { ver: true, crear: false, editar: false, eliminar: false },
        compras: { ver: true, crear: false, editar: false, eliminar: false },
        facturas: { ver: true, crear: false, editar: false, eliminar: false },
        cuentas: { ver: true, crear: true, editar: true, eliminar: false },
        reportes: { ver: true, crear: false, editar: false, eliminar: false },
    },
    ALMACENERO: {
        dashboard: { ver: true, crear: false, editar: false, eliminar: false },
        proveedores: { ver: true, crear: false, editar: false, eliminar: false },
        categorias: { ver: true, crear: true, editar: true, eliminar: false },
        productos: { ver: true, crear: true, editar: true, eliminar: false },
        compras: { ver: true, crear: true, editar: true, eliminar: false },
        reportes: { ver: true, crear: false, editar: false, eliminar: false },
    },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const nombreCompleto = localStorage.getItem('nombreCompleto');
        const rol = localStorage.getItem('rol');

        if (token && username && nombreCompleto && rol) {
            setUser({ token, username, nombreCompleto, rol });
        }
    }, []);

    const login = (data: AuthUser) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('nombreCompleto', data.nombreCompleto);
        localStorage.setItem('rol', data.rol);
        setUser(data);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const puede = (modulo: string, accion: 'ver' | 'crear' | 'editar' | 'eliminar') => {
        const rol = user?.rol || '';
        return permisos[rol]?.[modulo]?.[accion] || false;
    };

    const modulosVisibles = () => {
        const rol = user?.rol || '';
        if (!permisos[rol]) return [];
        return Object.entries(permisos[rol])
            .filter(([_, p]) => p.ver)
            .map(([modulo]) => modulo);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, puede, modulosVisibles }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe estar dentro de AuthProvider');
    return context;
}