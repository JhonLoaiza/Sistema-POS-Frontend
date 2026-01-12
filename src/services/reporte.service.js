// frontend/src/services/reporte.service.js

import client from '../config/axios-client';
import authService from './auth.service';

const authHeader = () => {
    const usuario = authService.getUsuarioActual();
    if (usuario && usuario.token) {
        return { Authorization: 'Bearer ' + usuario.token };
    } else {
        return {};
    }
};

const reporteService = {
    /**
     * Obtiene el reporte diario
     * @param {string} fecha - Formato 'YYYY-MM-DD'
     * URL Final: .../api/reportes/diario
     */
    getReporteDiario: (fecha) => {
        return client.get('/reportes/diario', { 
            headers: authHeader(),
            params: { fecha } 
        });
    },

    /**
     * URL Final: .../api/reportes/rankings
     */
    getRankings: () => {
        return client.get('/reportes/rankings', { headers: authHeader() });
    },

    /**
     * URL Final: .../api/reportes/semana
     */
    getVentasSemana: () => {
        return client.get('/reportes/semana', { headers: authHeader() });
    },
};

export default reporteService;