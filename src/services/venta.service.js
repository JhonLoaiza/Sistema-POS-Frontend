// frontend/src/services/venta.service.js

import client from '../config/axios-client';
import authService from './auth.service';

const authHeader = () => {
    const usuario = authService.getUsuarioActual();
    if(usuario && usuario.token) {
        return { Authorization: 'Bearer ' + usuario.token };
    } else {
        return {};
    }
};

const ventaService = {
    crearVenta: (ventaData) => {
        // URL Final: .../api/ventas
        return client.post('/ventas', ventaData, { headers: authHeader() });
    }
};

export default ventaService;