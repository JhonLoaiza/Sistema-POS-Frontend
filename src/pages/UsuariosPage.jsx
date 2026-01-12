import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import usuarioService from '../services/usuario.service';

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '', username: '', password: '', rol: 'cajero'
    });

    // --- MEJORA: LECTURA DE ROL SEGURA ---
    // Esta función evita que la página se rompa si los datos están corruptos
    const getRolActual = () => {
        try {
            const stored = localStorage.getItem('usuario');
            if (!stored) return 'invitado';
            
            const parsed = JSON.parse(stored);
            // Intentamos leer el rol desde la raíz o desde el objeto anidado usuario
            return parsed.rol || parsed.usuario?.rol || 'invitado';
        } catch (error) {
            console.error("Error leyendo localStorage:", error);
            return 'invitado';
        }
    };

    const rolActual = getRolActual();

    useEffect(() => {
        if (rolActual === 'admin') {
            cargarUsuarios();
        }
    }, [rolActual]);

    const cargarUsuarios = async () => {
        try {
            const res = await usuarioService.obtenerUsuarios();
            setUsuarios(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar lista de usuarios");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await usuarioService.crearUsuario(formData);
            toast.success("Usuario creado correctamente");
            setFormData({ nombre: '', username: '', password: '', rol: 'cajero' }); 
            cargarUsuarios();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al crear");
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
        try {
            await usuarioService.eliminarUsuario(id);
            toast.success("Eliminado");
            cargarUsuarios();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    // Función para limpiar datos si hay error
    const forzarLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // --- PANTALLA DE BLOQUEO (SI NO ERES ADMIN) ---
    if (rolActual !== 'admin') {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger shadow-sm p-5">
                    <h1 className="display-1"><i className="bi bi-shield-lock-fill"></i></h1>
                    <h2 className="fw-bold">Acceso Denegado</h2>
                    <p className="lead">Solo el Administrador puede ver esta sección.</p>
                    <hr />
                    <p className="text-muted small">
                        Tu rol actual detectado es: <strong>{rolActual}</strong>
                    </p>
                    
                    <div className="mt-4">
                        <p className="small mb-2">¿Crees que es un error de datos?</p>
                        <button onClick={forzarLogout} className="btn btn-outline-danger">
                            <i className="bi bi-arrow-clockwise me-2"></i>Reiniciar Sesión (Limpiar datos)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- PANTALLA DE ADMINISTRADOR ---
    return (
        <div className="container mt-4">
            <h2 className="mb-4"><i className="bi bi-people-fill me-2"></i>Gestión de Personal</h2>

            <div className="row">
                {/* FORMULARIO */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-primary text-white fw-bold">Nuevo Usuario</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-control" required 
                                        value={formData.nombre} 
                                        onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                        placeholder="Ej: Juan Pérez"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Usuario (Login)</label>
                                    <input type="text" className="form-control" required 
                                        value={formData.username} 
                                        onChange={e => setFormData({...formData, username: e.target.value})} 
                                        placeholder="Ej: juanperez"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Contraseña</label>
                                    <input type="password" class="form-control" required 
                                        value={formData.password} 
                                        onChange={e => setFormData({...formData, password: e.target.value})} 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Rol</label>
                                    <select className="form-select" value={formData.rol} 
                                        onChange={e => setFormData({...formData, rol: e.target.value})}>
                                        <option value="cajero">Vendedor (Cajero)</option>
                                        <option value="admin">Administrador (Dueño)</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-success w-100">
                                    <i className="bi bi-person-plus me-2"></i>Crear Usuario
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* LISTA DE USUARIOS */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white fw-bold">Lista de Accesos</div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-3">Nombre</th>
                                        <th>Usuario</th>
                                        <th>Rol</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">
                                                No hay usuarios registrados aparte de ti.
                                            </td>
                                        </tr>
                                    ) : (
                                        usuarios.map(u => (
                                            <tr key={u.id}>
                                                <td className="ps-3 fw-bold">{u.nombre}</td>
                                                <td>{u.username}</td>
                                                <td>
                                                    <span className={`badge ${u.rol === 'admin' ? 'bg-danger' : 'bg-info text-dark'}`}>
                                                        {u.rol ? u.rol.toUpperCase() : 'SIN ROL'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger" 
                                                        onClick={() => handleEliminar(u.id)}
                                                        title="Eliminar usuario"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsuariosPage;