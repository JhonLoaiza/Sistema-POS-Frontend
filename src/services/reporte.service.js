import axios from 'axios';
import authService from './auth.service';

const API_URL = 'https://api-tienda-jhon.onrender.com' || 'http://localhost:5000/api/reportes/';

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
     */
    getReporteDiario: (fecha) => {
        // Enviamos la fecha como parámetro de consulta (?fecha=...)
        return axios.get(API_URL + 'diario', { 
            headers: authHeader(),
            params: { fecha } 
        });
    },

    getRankings: () => {
        return axios.get(API_URL + 'rankings', { headers: authHeader() });
    },

    getVentasSemana: () => {
        return axios.get(API_URL + 'semana', { headers: authHeader() });
    },
};

export default reporteService;