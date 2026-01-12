// frontend/src/services/producto.service.js

import client from '../config/axios-client';
import authService from './auth.service';

/**
 * Función helper para obtener la cabecera de autorización
 */
const authHeader = () => {
    const usuario = authService.getUsuarioActual();
    if (usuario && usuario.token) {
        return { Authorization: 'Bearer ' + usuario.token };
    } else {
        return {};
    }
};

const productoService = {
    /**
     * (R-1.2) Obtener todos los productos
     * URL Final: .../api/productos
     */
    getProductos: () => {
        return client.get('/productos', { headers: authHeader() });
    },

    /**
     * (R-1.1) Crear un nuevo producto
     */
    createProducto: (productoData) => {
        return client.post('/productos', productoData, { headers: authHeader() });
    },

    /**
     * (R-1.3) Actualizar un producto
     * URL Final: .../api/productos/123
     */
    updateProducto: (id, productoData) => {
        // Usamos comillas invertidas para insertar el ID limpiamente
        return client.put(`/productos/${id}`, productoData, { headers: authHeader() });
    },

    /**
     * (R-1.X) "Eliminar" (desactivar) un producto
     */
    deleteProducto: (id) => {
        return client.delete(`/productos/${id}`, { headers: authHeader() });
    }
};

export default productoService;