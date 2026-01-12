import axios from 'axios';
import authService from './auth.service';

const API_URL = 'https://api-tienda-jhon.onrender.com' || 'http://localhost:5000/api/ventas/';

const authHeader = () => {
    const usuario = authService.getUsuarioActual();
    if(usuario && usuario.token) {
        return { Authorization: 'Bearer ' + usuario.token };
    }else{
        return {};
    }
};

const ventaService = {
    crearVenta: (ventaData) => {
        return axios.post(API_URL, ventaData, { headers: authHeader() });
    }
};

export default ventaService;