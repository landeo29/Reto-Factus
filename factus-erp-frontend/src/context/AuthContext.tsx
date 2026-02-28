import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

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

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe estar dentro de AuthProvider');
    return context;
}