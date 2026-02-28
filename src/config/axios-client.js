// src/config/axios-client.js
import axios from 'axios';

const client = axios.create({
    // CAMBIO IMPORTANTE:
    // En Create React App se usa 'process.env' y las variables DEBEN empezar con 'REACT_APP_'
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Interceptor para agregar el token JWT a todas las peticiones
client.interceptors.request.use(
    (config) => {
        // Obtener el usuario del localStorage
        const usuarioStr = localStorage.getItem('usuario');
        
        if (usuarioStr) {
            try {
                const usuario = JSON.parse(usuarioStr);
                
                // Si existe el token, agregarlo al header Authorization
                if (usuario.token) {
                    config.headers.Authorization = `Bearer ${usuario.token}`;
                }
            } catch (error) {
                console.error('Error al parsear usuario del localStorage:', error);
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si recibimos 401 (no autorizado), limpiar el localStorage y redirigir al login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('usuario');
            
            // Solo redirigir si no estamos ya en la página de login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default client;