// src/config/axios-client.js
import axios from 'axios';

const client = axios.create({
    // CAMBIO IMPORTANTE:
    // En Create React App se usa 'process.env' y las variables DEBEN empezar con 'REACT_APP_'
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

export default client;