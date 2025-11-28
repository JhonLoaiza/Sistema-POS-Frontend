// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import VentasPage from './pages/VentasPage.jsx';
import InventarioPage from './pages/InventarioPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

// --- ¡Mejoramos los Placeholders! ---

// Función helper para crear una página con tarjeta
const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm">
        <div className="card-header">
            <h2 className="mb-0">{title}</h2>
        </div>
        <div className="card-body">
            {children || <p>Contenido de la página...</p>}
        </div>
    </div>
);

// Usamos el PageWrapper para nuestras páginas
// const InventarioPage = () => <PageWrapper title="Gestión de Inventario" />;
const NotFoundPage = () => <h1>404 - Página no encontrada</h1>;


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* --- Rutas Protegidas --- */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ventas" element={<VentasPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="reportes" element={<ReportesPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;