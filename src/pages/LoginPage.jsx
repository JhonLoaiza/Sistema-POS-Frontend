import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './LoginPage.css';

function LoginPage() {
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
            await login(username, password);
            setLoading(false);
            navigate('/dashboard');
        } catch (error) {
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

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="shape"></div>
                <div className="shape"></div>
            </div>
            
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-container">
                        <i className="bi bi-shop-window"></i>
                    </div>
                    <h1 className="app-title">SmartPOS</h1>
                    <p className="app-subtitle">Sistema de Gestión Inteligente</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group-custom">
                        <i className="bi bi-person-fill"></i>
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group-custom">
                        <i className="bi bi-lock-fill"></i>
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Ingresando...
                            </>
                        ) : (
                            <>
                                <span>Ingresar</span>
                                <i className="bi bi-arrow-right-circle"></i>
                            </>
                        )}
                    </button>

                    {message && (
                        <div className="alert-custom">
                            <i className="bi bi-exclamation-circle"></i>
                            {message}
                        </div>
                    )}
                </form>

                <div className="login-footer">
                    <p>© 2025 SmartPOS - Todos los derechos reservados</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;