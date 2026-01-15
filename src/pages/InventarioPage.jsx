import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productoService from '../services/producto.service';
import { useAuth } from '../context/AuthContext.jsx';
import ProductoModal from '../components/ProductoModal.jsx';
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters.js';

// Componente envoltorio para el diseño
const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm h-100">
        <div className="card-header bg-white py-3">
            <h4 className="mb-0 text-primary"><i className="bi bi-box-seam me-2"></i>{title}</h4>
        </div>
        <div className="card-body">
            {children || <p>Contenido de la página...</p>}
        </div>
    </div>
);

function InventarioPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para el Modal y Selección
    const [showModal, setShowModal] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    
    // Estado para el Buscador
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            setLoading(true);
            const response = await productoService.getProductos();
            setProductos(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error al cargar el inventario.');
            setLoading(false);
        }
    };

    // --- FUNCIÓN AUXILIAR PARA IMÁGENES (FIX CLOUDINARY + LOCAL) ---
    const getImagenUrl = (imagen) => {
        if (!imagen) return null; // Si es null, retornamos null para mostrar el icono

        // 1. Si la imagen viene de Cloudinary (empieza con http), la usamos tal cual
        if (imagen.startsWith('http')) {
            return imagen;
        }

        // 2. Si es una imagen vieja (local), construimos la URL del servidor
        // NOTA: Al no usar Vite, usamos process.env.REACT_APP_API_URL
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        // Quitamos '/api' para obtener la raíz del servidor (donde vive la carpeta uploads)
        const SERVER_URL = API_URL.replace('/api', ''); 
        
        // Asegúrate de que tu backend sirva la imagen correctamente. 
        // Si en la BD guardaste "uploads/foto.jpg", esto funcionará:
        return `${SERVER_URL}/${imagen}`;
    };
    
    // --- MANEJADORES DEL MODAL ---
    const handleCrear = () => {
        setProductoSeleccionado(null);
        setShowModal(true);
    };

    const handleEditar = (producto) => {
        setProductoSeleccionado(producto);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setProductoSeleccionado(null);
    };

    const handleSave = async (productoData) => {
        try {
            if (productoSeleccionado) {
                await productoService.updateProducto(productoSeleccionado.id, productoData);
                toast.success('Producto actualizado exitosamente');
            } else {
                await productoService.createProducto(productoData);
                toast.success('Producto creado exitosamente');
            }
            handleCloseModal();
            cargarProductos();
        } catch (err) {
            console.error(err);
            toast.error('Error al guardar el producto.');
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await productoService.deleteProducto(id);
                toast.success('Producto eliminado');
                cargarProductos(); 
            } catch (err) {
                toast.error('Error al eliminar el producto.');
            }
        }
    };

    // --- RENDERIZADO ---
    let contenido;
    if (loading) {
        contenido = <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>;
    } else if (error) {
        contenido = <div className="alert alert-danger">{error}</div>;
    } else {
        // Filtramos los productos antes de mostrarlos
        const productosFiltrados = productos.filter(p =>
            p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            (p.codigo_barras && p.codigo_barras.includes(filtro))
        );

        contenido = (
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th style={{width: '80px'}}>Img</th>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Costo</th>
                            <th>Venta</th>
                            <th>Stock</th>
                            {user && user.usuario.rol === 'admin' && <th>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {productosFiltrados.map((producto) => (
                            <tr key={producto.id}>
                                {/* Columna Imagen: APLICAMOS EL FIX AQUÍ */}
                                <td>
                                    {producto.imagen ? (
                                        <img 
                                            src={getImagenUrl(producto.imagen)} 
                                            alt={producto.nombre} 
                                            className="img-thumbnail"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/50?text=Error"; }}
                                        />
                                    ) : (
                                        <div className="bg-secondary text-white d-flex align-items-center justify-content-center rounded" style={{width: '50px', height: '50px'}}>
                                            <i className="bi bi-image"></i>
                                        </div>
                                    )}
                                </td>
                                <td>{producto.id}</td>
                                <td>{producto.codigo_barras || '-'}</td>
                                <td className="fw-bold">{producto.nombre}</td>
                                
                                {/* Usamos el formateador aquí */}
                                <td>{formatCurrencyCLP(producto.precio_costo)}</td>
                                <td>{formatCurrencyCLP(producto.precio_venta)}</td>
                                
                                <td>
                                    <span className={`badge ${producto.stock <= producto.stock_minimo ? 'bg-danger' : 'bg-success'}`}>
                                        {producto.stock}
                                    </span>
                                </td>
                                
                                {/* Botones de Acción */}
                                {user && user.usuario.rol === 'admin' && (
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => handleEditar(producto)} 
                                        >
                                            <i className="bi bi-pencil-fill"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleEliminar(producto.id)}
                                        >
                                            <i className="bi bi-trash-fill"></i>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {productosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center py-4 text-muted">
                                    No se encontraron productos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <PageWrapper title="Gestión de Inventario">
            {/* Barra superior: Botones + Buscador */}
            {user && user.usuario.rol === 'admin' && (
                <div className="row mb-3 g-2 align-items-center">
                    <div className="col-md-5 d-flex">
                        <button className="btn btn-success me-2" onClick={handleCrear}>
                            <i className="bi bi-plus-circle me-2"></i>
                            Crear Nuevo
                        </button>
                        
                        <button className="btn btn-primary" onClick={() => navigate('/compras/nueva')}>
                            <i className="bi bi-receipt me-2"></i>
                            Ingresar Factura
                        </button>
                        
                    </div>
                    <div className="col-md-7">
                        <div className="input-group">
                            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por nombre o código..."
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {contenido}

            <ProductoModal 
                show={showModal}
                handleClose={handleCloseModal}
                producto={productoSeleccionado}
                onSave={handleSave}
            />
        </PageWrapper>
    );
}

export default InventarioPage;