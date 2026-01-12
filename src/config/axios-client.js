// src/config/axios-client.js
import axios from 'axios';

const client = axios.create({
    // Aquí usamos la variable UNA SOLA VEZ.
    // Si mañana cambia la URL, solo tocas este archivo.
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export default client;