// frontend/src/services/auth.service.js

// IMPORTANTE: Ajusta la ruta '../config/axios-client' si tu carpeta config está en otro lado
import client from '../config/axios-client';

const authService = {
    /**
     * Llama al endpoint /api/usuarios/login
     * @param {string} username
     * @param {string} password
     */
    login: (username, password) => {
        // YA NO usas "axios.post", usas "client.post".
        // YA NO pones la URL completa, solo la parte final '/login'.
        // Automáticamente se convierte en: ".../api/usuarios/login"
        return client.post('/login', {
            username,
            password,
        });
    },

    /**
     * Cierra la sesión
     */
    logout: () => {
        localStorage.removeItem('usuario');
    },

    /**
     * Obtiene el usuario actual
     */
    getUsuarioActual: () => {
        // Agregamos un try/catch por seguridad, por si el JSON está corrupto
        try {
            return JSON.parse(localStorage.getItem('usuario'));
        } catch (error) {
            return null;
        }
    }
};

export default authService;