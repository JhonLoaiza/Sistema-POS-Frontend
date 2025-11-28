import axios from 'axios';
import authService from './auth.service';

const API_URL = 'http://localhost:5000/api/reportes/';

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
    }
};

export default reporteService;