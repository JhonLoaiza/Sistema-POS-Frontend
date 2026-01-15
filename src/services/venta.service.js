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
    },

    // 2. Obtener el historial (ESTA ES LA QUE TE FALTA)
    getVentas: () => {
        return client.get('/ventas');
    },

    // 3. Anular una venta por ID
    anularVenta: (id) => {
        return client.delete(`/ventas/${id}`);
    }
};

export default ventaService;