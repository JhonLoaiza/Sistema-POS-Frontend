// frontend/src/services/usuario.service.js (o el nombre que tenga tu archivo)

import client from '../config/axios-client';

// Nota: Como no vi que usaras authHeader aquí, lo dejé sin token.
// Si necesitas proteger estas rutas, avísame para agregarlo.

const crearUsuario = (datos) => {
    // URL Final: .../api/usuarios
    return client.post('/usuarios', datos);
};

const obtenerUsuarios = () => {
    // URL Final: .../api/usuarios
    return client.get('/usuarios');
};

const eliminarUsuario = (id) => {
    // URL Final: .../api/usuarios/123
    return client.delete(`/usuarios/${id}`);
};

export default { crearUsuario, obtenerUsuarios, eliminarUsuario };