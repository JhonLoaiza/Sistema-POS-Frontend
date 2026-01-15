import React, { useState } from 'react'; // 1. Importamos useState
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './MainLayout.css'; 

function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // 2. Añadimos el estado para controlar el sidebar en móvil
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // 3. Función para cerrar el sidebar (útil al hacer clic en un enlace)
    const closeSidebar = () => {
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div>
            
            {/* --- 4. Sidebar (Ahora con estado) --- */}
            {/* Le aplicamos la clase 'show' dinámicamente */}
            <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                <div className="sidebar-sticky-content">
                    
                    {/* Botón de Cerrar (Solo visible en móvil) */}
                    <button 
                        className="btn btn-link text-white d-md-none sidebar-close-btn"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    <NavLink className="navbar-brand text-white mb-4" to="/dashboard" onClick={closeSidebar}>
                        <i className="bi bi-shop me-2"></i>
                        Tienda POS
                    </NavLink>
                    
                    <ul className="nav nav-pills flex-column mb-auto">
                        {/* 5. Hacemos que los enlaces cierren el menú en móvil */}
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/ventas" onClick={closeSidebar}>
                                <i className="bi bi-cart-plus me-2"></i>
                                Punto de Venta
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/inventario" onClick={closeSidebar}>
                                <i className="bi bi-box-seam me-2"></i>
                                Inventario
                            </NavLink>
                        </li>
                        {user && user.usuario.rol === 'admin' && (
                            <>
                                <hr className="text-secondary my-2" />
                                <div className="text-uppercase small text-secondary fw-bold mb-2 ps-3">Administración</div>

                                {/* 3. Historial de Compras (¡NUEVO!) */}
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/compras" onClick={closeSidebar}>
                                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                                        Historial Compras
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/historial" className="nav-link" onClick={closeSidebar}>
                                    <i className="bi bi-clock-history me-2"></i>
                                    Historial de Ventas
                                    </NavLink>
                                </li>

                                {/* 4. Reportes */}
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/reportes" onClick={closeSidebar}>
                                        <i className="bi bi-bar-chart-line me-2"></i>
                                        Reportes Diario
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/usuarios" className="nav-link text-warning fw-bold">
                                        <i className="bi bi-people-fill me-2"></i> Usuarios
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                    
                    <hr className="text-white" />
                    <div className="text-white mb-2">
                        <i className="bi bi-person-circle me-2"></i>
                        Hola, {user ? user.usuario.nombre : 'Usuario'}
                    </div>
                    <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-1"></i>
                        Salir
                    </button>
                </div>
            </div>

            {/* --- Contenido Principal (Columna Derecha) --- */}
            <div className="main-content">
                
                {/* --- 6. Navbar Móvil (Hamburguesa) --- */}
                {/* Esta barra solo se ve en pantallas pequeñas (d-md-none) */}
                <nav className="navbar navbar-light bg-light fixed-top d-md-none shadow-sm">
                    <div className="container-fluid">
                        <button 
                            className="btn btn-link" 
                            type="button"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <i className="bi bi-list fs-3"></i> {/* Ícono Hamburguesa */}
                        </button>
                        <span className="navbar-brand mb-0 h1">
                            Tienda POS
                        </span>
                    </div>
                </nav>
                
                {/* 7. El Outlet (tu página) ahora vive aquí */}
                <Outlet />
            </div>
        </div>
    );
}

export default MainLayout;