// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import VentasPage from './pages/VentasPage.jsx';
import InventarioPage from './pages/InventarioPage.jsx';
import ReportesPage from './pages/ReportesPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IngresoCompraPage from './pages/IngresoCompraPage.jsx';
import HistorialComprasPage from './pages/HistorialCompraPages.jsx';
import HistorialPage from './pages/HistorialPage.jsx';
import HistorialMermasPage from './pages/HistorialMermasPage.jsx';
import UsuariosPage from './pages/UsuariosPage.jsx';

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
            <Route path="compras/nueva" element={<IngresoCompraPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="compras" element={<HistorialComprasPage />} />
            <Route path="/historial" element={<HistorialPage />} />
            <Route path="/mermas" element={<HistorialMermasPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;