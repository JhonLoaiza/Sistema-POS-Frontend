// frontend/src/services/auth.service.js

import client from '../config/axios-client';

const authService = {
    login: (username, password) => {
        return client.post('/auth/login', {
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