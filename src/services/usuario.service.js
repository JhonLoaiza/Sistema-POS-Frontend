import axios from 'axios';

const API_URL = 'https://api-tienda-jhon.onrender.com' || 'http://localhost:5000/api/usuarios';

const crearUsuario = (datos) => axios.post(API_URL, datos);
const obtenerUsuarios = () => axios.get(API_URL);
const eliminarUsuario = (id) => axios.delete(`${API_URL}/${id}`);

export default { crearUsuario, obtenerUsuarios, eliminarUsuario };