// frontend/src/services/gastos.service.js

import client from '../config/axios-client';

const gastosService = {
registrarRetiro: (datos) => {
        // datos = { monto: 5000, descripcion: "Pago proveedor" }
        return client.post('/gastos', datos);
    },

    obtenerGastosHoy: () => {
        // Esto se traduce a: .../api/gastos/hoy
        return client.get('/gastos/hoy');
    }
};

export default gastosService;