import axios from '../config/axios-client';

/**
 * Service para gestión de mermas/pérdidas
 */
const mermaService = {
    /**
     * Registra una nueva merma
     * @param {Object} mermaData - Datos de la merma
     * @returns {Promise} Respuesta del servidor
     */
    registrar: async (mermaData) => {
        return axios.post('/mermas', mermaData);
    },
    
    /**
     * Alias de registrar para compatibilidad
     * @param {Object} mermaData - Datos de la merma
     * @returns {Promise} Respuesta del servidor
     */
    createMerma: async (mermaData) => {
        return axios.post('/mermas', mermaData);
    },
    
    /**
     * Obtiene todas las mermas
     * @returns {Promise} Lista de mermas
     */
    obtenerTodas: async () => {
        return axios.get('/mermas');
    },
    
    /**
     * Obtiene mermas del día actual
     * @returns {Promise} Mermas de hoy
     */
    obtenerHoy: async () => {
        return axios.get('/mermas/hoy');
    },
    
    /**
     * Obtiene mermas por rango de fechas
     * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
     * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
     * @returns {Promise} Mermas en el rango
     */
    obtenerPorRango: async (fechaInicio, fechaFin) => {
        return axios.get(`/mermas/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
    },
    
    /**
     * Obtiene estadísticas de mermas
     * @returns {Promise} Estadísticas
     */
    obtenerEstadisticas: async () => {
        return axios.get('/mermas/estadisticas');
    },
    
    /**
     * Obtiene productos con más mermas
     * @param {number} limit - Cantidad de productos
     * @returns {Promise} Productos con más mermas
     */
    obtenerProductosConMasMermas: async (limit = 10) => {
        return axios.get(`/mermas/productos-mas-mermas?limit=${limit}`);
    }
};

export default mermaService;
