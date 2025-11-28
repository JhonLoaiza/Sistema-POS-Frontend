import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Este componente es nuestro "guardia" de rutas.
 */
function ProtectedRoute() {
    // 1. Obtenemos el usuario de nuestro "cerebro" global (AuthContext)
    const { user } = useAuth();

    // 2. Comprobamos la lógica
    if (!user) {
        // 3. Si NO hay usuario, lo redirigimos a la fuerza al login
        return <Navigate to="/login" replace />;
    }

    // 4. Si SÍ hay usuario, le mostramos la página que quería ver.
    // <Outlet /> es el componente "hijo" que estamos protegiendo (ej. DashboardPage)
    return <Outlet />;
}

export default ProtectedRoute;