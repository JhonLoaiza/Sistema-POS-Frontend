// frontend/src/services/gastos.service.js

import client from '../config/axios-client';

const gastosService = {
    registrarGasto: (data) => {
        // Al usar client, esto se traduce a: .../api/gastos
        return client.post('/gastos', data);
    },

    obtenerGastosHoy: () => {
        // Esto se traduce a: .../api/gastos/hoy
        return client.get('/gastos/hoy');
    }
};

export default gastosService;