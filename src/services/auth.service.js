// frontend/src/services/auth.service.js

import client from '../config/axios-client';

const authService = {
    login: (username, password) => {
        // CORRECCIÓN: Agregamos '/usuarios' antes de '/login'
        return client.post('/usuarios/login', {
            username,
            password,
        });
    },

    logout: () => {
        localStorage.removeItem('usuario');
    },

    getUsuarioActual: () => {
        try {
            return JSON.parse(localStorage.getItem('usuario'));
        } catch (error) {
            return null;
        }
    }
};

export default authService;