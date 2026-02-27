import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productoService from '../services/producto.service';
import mermaService from '../services/merma.service';
import { useAuth } from '../context/AuthContext.jsx';
import ProductoModal from '../components/ProductoModal.jsx';
import MermaModal from '../components/MermaModal.jsx';
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
    
    // Estados para Modal de Mermas
    const [showMermaModal, setShowMermaModal] = useState(false);
    const [productoMerma, setProductoMerma] = useState(null);
    
    // Estado para el Buscador
    const [filtro, setFiltro] = useState('');
    
    // Ref para mantener el focus en el input
    const inputRef = React.useRef(null);
    
    // Ref para detectar nuevo escaneo
    const ultimoEscaneoRef = React.useRef(Date.now());
    const tiempoEntreEscaneos = 1000; // 1 segundo entre escaneos

    useEffect(() => {
        cargarProductos();
    }, []);

    // Mantener focus en el input siempre
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [productos, filtro]);

    // Detectar escaneo de código de barras
    useEffect(() => {
        if (filtro.length >= 10 && productos.length > 0) {
            const productoExacto = productos.find(p => p.codigo_barras === filtro);
            if (productoExacto) {
                // Producto encontrado - el filtro permanece activo
                toast.success(`Producto encontrado: ${productoExacto.nombre}`);
                ultimoEscaneoRef.current = Date.now();
            }
        }
    }, [filtro, productos]);
    
    // Manejar cambio de filtro con detección de nuevo escaneo
    const handleFiltroChange = (e) => {
        const nuevoValor = e.target.value;
        const ahora = Date.now();
        
        // Si ha pasado más de 1 segundo desde el último escaneo y el input tiene contenido,
        // asumimos que es un nuevo escaneo y limpiamos primero
        if (ahora - ultimoEscaneoRef.current > tiempoEntreEscaneos && filtro.length > 0 && nuevoValor.length > filtro.length) {
            setFiltro(nuevoValor.slice(-1)); // Solo el último carácter
            ultimoEscaneoRef.current = ahora;
        } else {
            setFiltro(nuevoValor);
        }
    };

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
        if (!imagen) return null;

        // Si la imagen viene de Cloudinary (empieza con http), la usamos tal cual
        if (imagen.startsWith('http')) {
            return imagen;
        }

        // Construir URL del servidor
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const SERVER_URL = API_URL.replace('/api', '');
        
        // Limpiar la ruta: quitar slash inicial si existe
        const rutaLimpia = imagen.startsWith('/') ? imagen.substring(1) : imagen;
        
        return `${SERVER_URL}/${rutaLimpia}`;
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

    const handleRegistrarMerma = (producto) => {
        setProductoMerma(producto);
        setShowMermaModal(true);
    };

    const handleCloseMermaModal = () => {
        setShowMermaModal(false);
        setProductoMerma(null);
    };

    const handleSaveMerma = async (mermaData) => {
        try {
            await mermaService.createMerma(mermaData);
            toast.success('Merma registrada exitosamente');
            handleCloseMermaModal();
            cargarProductos();
        } catch (err) {
            console.error(err);
            toast.error('Error al registrar la merma');
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
                            <th>Acciones</th>
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
                                <td>
                                    {user && user.usuario.rol === 'admin' && (
                                        <>
                                            <button 
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => handleEditar(producto)} 
                                                title="Editar"
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger me-2"
                                                onClick={() => handleEliminar(producto.id)}
                                                title="Eliminar"
                                            >
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleRegistrarMerma(producto)}
                                        title="Registrar Merma"
                                    >
                                        <i className="bi bi-exclamation-triangle"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {productosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center py-4 text-muted">
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
                                ref={inputRef}
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por nombre o código..."
                                value={filtro}
                                onChange={handleFiltroChange}
                                autoFocus
                            />
                            {filtro && (
                                <button 
                                    className="btn btn-outline-secondary" 
                                    type="button"
                                    onClick={() => setFiltro('')}
                                    title="Limpiar búsqueda"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
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

            <MermaModal 
                show={showMermaModal}
                handleClose={handleCloseMermaModal}
                producto={productoMerma}
                onSave={handleSaveMerma}
            />
        </PageWrapper>
    );
}

export default InventarioPage;