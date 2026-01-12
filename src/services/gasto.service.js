import axios from 'axios';

// Asegúrate que el puerto 5000 sea el correcto de tu backend
const API_URL = 'https://api-tienda-jhon.onrender.com' || 'http://localhost:5000/api/gastos';

const registrarGasto = (data) => {
    return axios.post(API_URL, data);
};

const obtenerGastosHoy = () => {
    return axios.get(`${API_URL}/hoy`);
};

export default { registrarGasto, obtenerGastosHoy };