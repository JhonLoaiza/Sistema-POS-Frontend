import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './MainLayout.css'; 

function MainLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Estado para controlar el sidebar en móvil
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsSidebarOpen(false); // Asegurar cierre al salir
        navigate('/login');
    };
    
    // Función para cerrar el sidebar
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="d-flex h-100 position-relative">
            
            {/* --- 1. OVERLAY (FONDO OSCURO) --- */}
            {/* Esto permite cerrar el menú haciendo clic fuera de él en móviles */}
            {isSidebarOpen && (
                <div 
                    className="d-md-none"
                    onClick={closeSidebar}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1040 // Justo debajo del sidebar
                    }}
                />
            )}

            {/* --- 2. SIDEBAR --- */}
            <div 
                className={`sidebar bg-dark text-white p-3 ${isSidebarOpen ? 'show' : ''}`}
                style={{
                    // Estilos base para asegurar comportamiento si falla el CSS externo
                    transition: 'transform 0.3s ease-in-out',
                    zIndex: 1050
                }}
            >
                <div className="sidebar-sticky-content h-100 d-flex flex-column">
                    
                    {/* Cabecera Sidebar con Botón Cerrar */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <NavLink className="navbar-brand text-white fw-bold fs-4" to="/ventas" onClick={closeSidebar}>
                            <i className="bi bi-shop me-2"></i>
                            Tienda POS
                        </NavLink>
                        
                        <button 
                            className="btn btn-sm btn-outline-light d-md-none"
                            onClick={closeSidebar}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    
                    {/* Menú de Navegación */}
                    <ul className="nav nav-pills flex-column mb-auto">
                        <li className="nav-item mb-2">
                            <NavLink className="nav-link text-white" to="/ventas" onClick={closeSidebar}>
                                <i className="bi bi-cart-plus me-2"></i>
                                Punto de Venta
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink className="nav-link text-white" to="/inventario" onClick={closeSidebar}>
                                <i className="bi bi-box-seam me-2"></i>
                                Inventario
                            </NavLink>
                        </li>

                        {/* Sección Admin */}
                        {user && user.usuario.rol === 'admin' && (
                            <>
                                <hr className="text-secondary my-2" />
                                <div className="text-uppercase small text-secondary fw-bold mb-2 ps-3">Administración</div>

                                <li className="nav-item mb-2">
                                    <NavLink className="nav-link text-white" to="/compras" onClick={closeSidebar}>
                                        <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                                        Historial Compras
                                    </NavLink>
                                </li>
                                <li className="nav-item mb-2">
                                    <NavLink to="/historial" className="nav-link text-white" onClick={closeSidebar}>
                                        <i className="bi bi-clock-history me-2"></i>
                                        Historial Ventas
                                    </NavLink>
                                </li>
                                <li className="nav-item mb-2">
                                    <NavLink className="nav-link text-white" to="/reportes" onClick={closeSidebar}>
                                        <i className="bi bi-bar-chart-line me-2"></i>
                                        Reportes Diario
                                    </NavLink>
                                </li>
                                <li className="nav-item mb-2">
                                    <NavLink to="/usuarios" className="nav-link text-warning fw-bold" onClick={closeSidebar}>
                                        <i className="bi bi-people-fill me-2"></i> Usuarios
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                    
                    {/* Pie de página del Sidebar */}
                    <hr className="text-white" />
                    <div className="text-white mb-2 small">
                        <i className="bi bi-person-circle me-2"></i>
                        Hola, {user ? user.usuario.nombre : 'Usuario'}
                    </div>
                    <button className="btn btn-outline-danger w-100 btn-sm" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-1"></i>
                        Salir
                    </button>
                </div>
            </div>

            {/* --- 3. CONTENIDO PRINCIPAL --- */}
            <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
                
                {/* Navbar Móvil (Hamburguesa) - Solo visible en móvil */}
                <nav className="navbar navbar-light bg-white border-bottom d-md-none px-3 py-2 sticky-top">
                    <button 
                        className="btn btn-outline-primary" 
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>
                    <span className="navbar-brand mb-0 h1 ms-2 text-primary">
                        Tienda POS
                    </span>
                </nav>
                
                {/* Aquí se renderizan las páginas */}
                <div className="p-0 h-100 bg-light">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default MainLayout;