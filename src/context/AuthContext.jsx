import React, { createContext, useState, useContext } from 'react';
import authService from '../services/auth.service';

// 1. Creamos el Contexto (el "tubo" por donde viajará la info)
const AuthContext = createContext(null);

// 2. Creamos el Proveedor (el "motor" que provee la info)
export function AuthProvider({ children }) {
    // 3. El estado que queremos compartir: el usuario.
    // Buscamos en el localStorage si ya existe un usuario al cargar la app.
    const [user, setUser] = useState(() => authService.getUsuarioActual());

    // 4. Creamos una función de login para actualizar el estado
    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);
            if (response.data.token) {
                // Guardamos en el almacén
                localStorage.setItem('usuario', JSON.stringify(response.data));
                // Actualizamos el estado global
                setUser(response.data);
            }
            return response; // Devolvemos la respuesta para el LoginPage
        } catch (error) {
            // Si falla, nos aseguramos de que el estado esté vacío
            setUser(null);
            throw error; // Lanzamos el error para que LoginPage lo atrape
        }
    };

    // 5. Creamos una función de logout
    const logout = () => {
        authService.logout(); // Borra del almacén
        setUser(null); // Borra del estado global
    };

    // 6. Creamos el "paquete" de info que queremos compartir
    const value = {
        user,
        login,
        logout
    };

    // 7. Retornamos el Proveedor "envolviendo" a los hijos (nuestra App)
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 8. (Opcional pero recomendado) Un "Hook" personalizado
// Esto nos facilita usar el contexto en otros componentes
export function useAuth() {
    return useContext(AuthContext);
}