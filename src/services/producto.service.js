import axios from 'axios';
import authService from './auth.service'; // Importamos el servicio de auth

const API_URL = 'http://localhost:5000/api/productos/';

/**
 * Función helper para obtener la cabecera de autorización
 */
const authHeader = () => {
    const usuario = authService.getUsuarioActual(); // Obtenemos el usuario de localStorage
    if (usuario && usuario.token) {
        // Formato estándar de Bearer Token
        return { Authorization: 'Bearer ' + usuario.token };
    } else {
        return {};
    }
};

const productoService = {
    /**
     * (R-1.2) Obtener todos los productos
     */
    getProductos: () => {
        return axios.get(API_URL, { headers: authHeader() });
    },

    /**
     * (R-1.1) Crear un nuevo producto
     */
    createProducto: (productoData) => {
        return axios.post(API_URL, productoData, { headers: authHeader() });
    },

    /**
     * (R-1.3) Actualizar un producto
     */
    updateProducto: (id, productoData) => {
        return axios.put(API_URL + id, productoData, { headers: authHeader() });
    },

    /**
     * (R-1.X) "Eliminar" (desactivar) un producto
     */
    deleteProducto: (id) => {
        return axios.delete(API_URL + id, { headers: authHeader() });
    }
    
    // (Faltaría getProductoPorId, pero no lo usaremos en esta tabla)
};

export default productoService;