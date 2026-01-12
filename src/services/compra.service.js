import axios from 'axios';
import authService from './auth.service';

const API_URL = 'https://api-tienda-jhon.onrender.com' || 'http://localhost:5000/api/compras/';

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
        return axios.post(API_URL, compraData, { headers: authHeader() });
    },

    // Nuevas funciones
    getCompras: (desde, hasta) => {
        // Enviamos los params a la URL
        return axios.get(API_URL, { 
            headers: authHeader(),
            params: { desde, hasta } 
        });
    },

    getDetalleCompra: (id) => {
        return axios.get(API_URL + id, { headers: authHeader() });
    }
};

export default compraService;