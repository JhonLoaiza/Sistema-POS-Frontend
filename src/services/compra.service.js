// frontend/src/services/compra.service.js

// 1. Importamos nuestra instancia configurada
import client from '../config/axios-client';
import authService from './auth.service';

// 2. Función auxiliar para el header (se mantiene igual, pero es vital)
const authHeader = () => {
    const usuario = authService.getUsuarioActual();
    if (usuario && usuario.token) {
        return { Authorization: 'Bearer ' + usuario.token };
    } else {
        return {};
    }
};

const compraService = {
    registrarCompra: (compraData) => {
        // Usamos client.post apuntando a la ruta específica '/compras'
        return client.post('/compras', compraData, { headers: authHeader() });
    },

    getCompras: (desde, hasta) => {
        return client.get('/compras', { 
            headers: authHeader(),
            params: { desde, hasta } 
        });
    },

    getDetalleCompra: (id) => {
        // Usamos template literal para concatenar el ID limpiamente
        return client.get(`/compras/${id}`, { headers: authHeader() });
    }
};

export default compraService;