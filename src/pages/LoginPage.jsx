import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Importamos nuestro NUEVO hook 'useAuth'
import { useAuth } from '../context/AuthContext.jsx'; 

function LoginPage() {
    // 2. Obtenemos la función 'login' de nuestro contexto global
    const { login } = useAuth();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate(); 

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setMessage('');
        setLoading(true);

        try {
            // 3. ¡Usamos la función 'login' del contexto!
            await login(username, password);
            
            // 4. Si tiene éxito, redirigimos
            setLoading(false);
            navigate('/dashboard'); 
            // ¡Ya no necesitamos 'window.location.reload()'!
            // El estado global se actualiza solo y React reacciona.

        } catch (error) {
            // 5. El error viene del contexto
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();

            setLoading(false);
            setMessage(resMessage); 
        }
    };

    // ... (El JSX del return es EXACTAMENTE el mismo de antes)
    // ... (No necesitas copiarlo si ya lo tienes)
    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
            <div className="col-12 col-sm-10 col-md-6 col-lg-4">
                <div className="card shadow-lg border-0 rounded-3 p-4">
                    <div className="card-body">
                        
                        <h3 className="card-title text-center mb-4">Bienvenido</h3>
                        
                        <form onSubmit={handleLogin}>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    placeholder="tu-usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <label htmlFor="username">Usuario</label>
                            </div>

                            <div className="form-floating mb-4">
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    placeholder="tu-contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <label htmlFor="password">Contraseña</label>
                            </div>

                            <div className="d-grid gap-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-lg"
                                    disabled={loading}
                                >
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    )}
                                    Ingresar
                                </button>
                            </div>

                            {message && (
                                <div className="alert alert-danger mt-3 mb-0" role="alert">
                                    {message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;