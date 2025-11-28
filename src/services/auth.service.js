// frontend/src/services/auth.service.js
import axios from 'axios';

// Esta es la URL base de tu backend.
// (Asegúrate de que tu backend esté corriendo en el puerto 5000)
const API_URL = 'http://localhost:5000/api/usuarios/';

const authService = {
    /**
     * Llama al endpoint /api/usuarios/login
     * @param {string} username
     * @param {string} password
     */
    login: (username, password) => {
        return axios.post(API_URL + 'login', {
            username,
            password,
        });
    },

    /**
     * (Lo usaremos después) Cierra la sesión
     */
    logout: () => {
        // Borraremos el token del almacenamiento local
        localStorage.removeItem('usuario');
    },

    /**
     * (Lo usaremos después) Obtiene el usuario actual
     */
    getUsuarioActual: () => {
        return JSON.parse(localStorage.getItem('usuario'));
    }
    
    // (Aquí podríamos añadir el servicio de registro si quisiéramos)
};

export default authService;