import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientesPage from './pages/clientes/ClientesPage';
import ProveedoresPage from './pages/proveedores/ProveedoresPage';
import CategoriasPage from './pages/categorias/CategoriasPage';
import ProductosPage from './pages/productos/ProductosPage';
import VentasPage from './pages/ventas/VentasPage';


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/clientes" element={<ClientesPage />} />
                        <Route path="/proveedores" element={<ProveedoresPage />} />
                        <Route path="/categorias" element={<CategoriasPage />} />
                        <Route path="/productos" element={<ProductosPage />} />
                        <Route path="/ventas" element={<VentasPage />} />

                    </Route>
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;