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
     * URL Final: .../api/reportes/diario?fecha=YYYY-MM-DD
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

    /**
     * Obtiene el Cierre de Caja (Calcula efectivo vs gastos)
     * URL Final: .../api/reportes/cierre-caja?fecha=YYYY-MM-DD
     * --- ¡ESTA ES LA QUE FALTABA! ---
     */
    getCierreCaja: (fecha) => {
        return client.get('/reportes/cierre-caja', { 
            headers: authHeader(),
            params: { fecha } 
        });
    }
};

export default reporteService;