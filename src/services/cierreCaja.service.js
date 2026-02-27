import axiosClient from '../config/axios-client';

const cierreCajaService = {
    // Obtener datos para el cierre de caja
    obtenerDatos: (fecha) => {
        const params = fecha ? { fecha } : {};
        return axiosClient.get('/cierres-caja/datos', { params });
    },

    // Registrar cierre de caja
    registrarCierre: (datos) => {
        return axiosClient.post('/cierres-caja', datos);
    },

    // Obtener historial de cierres
    obtenerHistorial: (limite = 30) => {
        return axiosClient.get('/cierres-caja/historial', { params: { limite } });
    },

    // Obtener cierre específico
    obtenerPorId: (id) => {
        return axiosClient.get(`/cierres-caja/${id}`);
    }
};

export default cierreCajaService;
