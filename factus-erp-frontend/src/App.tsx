import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientesPage from './pages/clientes/ClientesPage';
import ProveedoresPage from './pages/proveedores/ProveedoresPage';
import CategoriasPage from './pages/categorias/CategoriasPage';
import ProductosPage from './pages/productos/ProductosPage';
import VentasPage from './pages/ventas/VentasPage';
import ComprasPage from './pages/compras/ComprasPage';
import CuentasPage from './pages/cuentas/CuentasPage';
import FacturasPage from './pages/facturas/FacturasPage';
import ReportesPage from './pages/reportes/ReportesPage';
import UsuariosPage from './pages/usuarios/UsuariosPage';

function ProtectedRoute({ modulo, children }: { modulo: string; children: React.ReactNode }) {
    const { puede } = useAuth();
    if (!puede(modulo, 'ver')) return <Navigate to="/" replace />;
    return <>{children}</>;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/clientes" element={<ProtectedRoute modulo="clientes"><ClientesPage /></ProtectedRoute>} />
                        <Route path="/proveedores" element={<ProtectedRoute modulo="proveedores"><ProveedoresPage /></ProtectedRoute>} />
                        <Route path="/categorias" element={<ProtectedRoute modulo="categorias"><CategoriasPage /></ProtectedRoute>} />
                        <Route path="/productos" element={<ProtectedRoute modulo="productos"><ProductosPage /></ProtectedRoute>} />
                        <Route path="/ventas" element={<ProtectedRoute modulo="ventas"><VentasPage /></ProtectedRoute>} />
                        <Route path="/compras" element={<ProtectedRoute modulo="compras"><ComprasPage /></ProtectedRoute>} />
                        <Route path="/cuentas" element={<ProtectedRoute modulo="cuentas"><CuentasPage /></ProtectedRoute>} />
                        <Route path="/facturas" element={<ProtectedRoute modulo="facturas"><FacturasPage /></ProtectedRoute>} />
                        <Route path="/reportes" element={<ProtectedRoute modulo="reportes"><ReportesPage /></ProtectedRoute>} />
                        <Route path="/usuarios" element={<ProtectedRoute modulo="usuarios"><UsuariosPage /></ProtectedRoute>} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;