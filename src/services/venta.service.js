// frontend/src/services/venta.service.js

import client from '../config/axios-client';
import authService from './auth.service';

// Función auxiliar para obtener el token
const authHeader = () => {
    const usuario = authService.getUsuarioActual();
    if(usuario && usuario.token) {
        return { Authorization: 'Bearer ' + usuario.token };
    } else {
        return {};
    }
};

const ventaService = {
    // 1. Crear venta (Esta ya estaba bien)
    crearVenta: (ventaData) => {
        return client.post('/ventas', ventaData, { headers: authHeader() });
    },

    // 2. Obtener historial (CORREGIDO: Agregamos authHeader)
   getVentas: (page = 1) => {
        return client.get('/ventas', { 
            headers: authHeader(),
            params: { page } // Axios lo convierte en ?page=X
        });
    },

    // 3. Anular venta (CORREGIDO: Agregamos authHeader)
    anularVenta: (id) => {
        return client.delete(`/ventas/${id}`, { headers: authHeader() });
    }
};

export default ventaService;