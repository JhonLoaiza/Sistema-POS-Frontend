import React, { useState, useEffect } from 'react';
import productoService from '../services/producto.service';
import ventaService from '../services/venta.service';
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters.js';

// Componente visual para envolver la página
const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm h-100">
        <div className="card-header bg-white py-3">
            <h4 className="mb-0 text-primary"><i className="bi bi-cart3 me-2"></i>{title}</h4>
        </div>
        <div className="card-body p-0 p-md-3">
            {children || <p>Contenido de la página...</p>}
        </div>
    </div>
);

function VentasPage() {
    // --- ESTADOS ---
    const [productos, setProductos] = useState([]);      // Inventario completo
    const [filtro, setFiltro] = useState('');            // Texto del buscador
    const [carrito, setCarrito] = useState([]);          // Items seleccionados
    const [loading, setLoading] = useState(true);

    // --- CARGAR PRODUCTOS AL INICIAR ---
    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const response = await productoService.getProductos();
            setProductos(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar productos", error);
            toast.error("Error de conexión. No se cargó el inventario.");
            setLoading(false);
        }
    };

    // --- LÓGICA DEL CARRITO ---

    // 1. Agregar o Incrementar
    const agregarAlCarrito = (producto) => {
        // Validación extra: No vender más del stock real
        const itemEnCarrito = carrito.find(item => item.id === producto.id);
        const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;

        if (cantidadActual >= producto.stock) {
            toast.warning(`No hay más stock de ${producto.nombre}`);
            return;
        }

        if (itemEnCarrito) {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad + 1 }
                    : item
            ));
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        }
    };

    // 2. Restar Cantidad
    const restarDelCarrito = (producto) => {
        if (producto.cantidad === 1) {
            eliminarDelCarrito(producto.id);
        } else {
            setCarrito(carrito.map(item =>
                item.id === producto.id
                    ? { ...item, cantidad: item.cantidad - 1 }
                    : item
            ));
        }
    };

    // 3. Eliminar Ítem completo
    const eliminarDelCarrito = (id) => {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    // --- LÓGICA DE PAGO (BACKEND) ---
    const handlePagar = async (metodoPago) => {
        if (carrito.length === 0) return;

        if (!window.confirm(`¿Confirmar venta por ${formatCurrencyCLP(totalCarrito)} con ${metodoPago.toUpperCase()}?`)) {
            return;
        }

        // Preparamos los datos como los quiere el Backend
        const ventaData = {
            metodo_pago: metodoPago,
            carrito: carrito.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad
            }))
        };

        try {
            setLoading(true); // Bloqueamos visualmente
            await ventaService.crearVenta(ventaData);
            
            toast.success("¡Venta registrada exitosamente!");
            setCarrito([]); // Limpiamos carrito
            setFiltro('');  // Limpiamos filtro
            
            // Recargamos productos para actualizar el stock visualmente
            cargarProductos(); 

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Error al procesar la venta.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // --- CÁLCULOS Y FILTROS ---

    // Filtro por Nombre o Código
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.includes(filtro))
    );

    // Suma Total
    const totalCarrito = carrito.reduce((acc, item) => {
        return acc + (item.precio_venta * item.cantidad);
    }, 0);


    // --- RENDERIZADO ---
    return (
        <PageWrapper title="Punto de Venta">
            <div className="row h-100">
                
                {/* === COLUMNA IZQUIERDA: Buscador y Productos === */}
                <div className="col-md-7 d-flex flex-column h-100">
                    
                    {/* Barra de Búsqueda */}
                    <div className="input-group mb-3 sticky-top">
                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Buscar producto..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            autoFocus
                        />
                    </div>
                    
                    {/* Lista de Productos (Con Scroll) */}
                    <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                        {loading && productos.length === 0 ? (
                            <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>
                        ) : (
                            <div className="list-group">
                                {productosFiltrados.map(producto => (
                                    <button
                                        key={producto.id}
                                        type="button"
                                        className={`list-group-item list-group-item-action d-flex align-items-center p-2 ${producto.stock <= 0 ? 'list-group-item-secondary' : ''}`}
                                        onClick={() => agregarAlCarrito(producto)}
                                        disabled={producto.stock <= 0}
                                    >
                                        {/* Imagen */}
                                        <div className="me-3 position-relative">
                                            {producto.imagen ? (
                                                <img 
                                                    src={`http://localhost:5000/${producto.imagen}`} 
                                                    alt={producto.nombre} 
                                                    className="rounded border"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <div className="bg-light d-flex align-items-center justify-content-center rounded border" style={{width: '60px', height: '60px'}}>
                                                    <i className="bi bi-box-seam text-muted fs-4"></i>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow-1 text-start">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0 fw-bold text-truncate" style={{maxWidth: '200px'}}>{producto.nombre}</h6>
                                                <span className="badge bg-primary rounded-pill">
                                                    {formatCurrencyCLP(producto.precio_venta)}
                                                </span>
                                            </div>
                                            <small className={producto.stock > 5 ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                Stock: {producto.stock}
                                            </small>
                                            {producto.codigo_barras && <small className="d-block text-muted" style={{fontSize: '0.75rem'}}>{producto.codigo_barras}</small>}
                                        </div>
                                    </button>
                                ))}
                                {productosFiltrados.length === 0 && !loading && (
                                    <div className="text-center p-4 text-muted">No se encontraron productos.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* === COLUMNA DERECHA: Carrito y Pago === */}
                <div className="col-md-5 mt-3 mt-md-0">
                    <div className="card shadow border-0 h-100 d-flex flex-column">
                        <div className="card-header bg-light fw-bold">
                            <i className="bi bi-cart-check me-2"></i> Carrito de Compras
                        </div>
                        
                        {/* Lista del Carrito (Scrollable) */}
                        <div className="card-body p-0 flex-grow-1" style={{ overflowY: 'auto', maxHeight: '50vh' }}>
                            <ul className="list-group list-group-flush">
                                {carrito.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="bi bi-cart-x display-1 mb-3 opacity-25"></i>
                                        <p>El carrito está vacío</p>
                                    </div>
                                ) : (
                                    carrito.map(item => (
                                        <li key={item.id} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="fw-bold">{item.nombre}</span>
                                                <span className="fw-bold">{formatCurrencyCLP(item.precio_venta * item.cantidad)}</span>
                                            </div>
                                            
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">Unit: {formatCurrencyCLP(item.precio_venta)}</small>
                                                
                                                <div className="btn-group btn-group-sm" role="group">
                                                    <button 
                                                        className="btn btn-outline-secondary"
                                                        onClick={(e) => { e.stopPropagation(); restarDelCarrito(item); }}
                                                    >
                                                        <i className="bi bi-dash"></i>
                                                    </button>
                                                    <button className="btn btn-outline-secondary disabled text-dark fw-bold" style={{width: '40px'}}>
                                                        {item.cantidad}
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-secondary"
                                                        onClick={(e) => { e.stopPropagation(); agregarAlCarrito(item); }}
                                                        disabled={item.cantidad >= item.stock}
                                                    >
                                                        <i className="bi bi-plus"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-danger ms-2"
                                                        onClick={(e) => { e.stopPropagation(); eliminarDelCarrito(item.id); }}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                        {/* Footer del Carrito (Totales y Botones) */}
                        <div className="card-footer bg-white border-top p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="fs-5">Total a Pagar:</span>
                                <span className="fs-3 fw-bold text-primary">{formatCurrencyCLP(totalCarrito)}</span>
                            </div>
                            
                            <div className="d-grid gap-2">
                                <button 
                                    className="btn btn-success btn-lg"
                                    disabled={carrito.length === 0 || loading}
                                    onClick={() => handlePagar('efectivo')}
                                >
                                    <i className="bi bi-cash-coin me-2"></i> Efectivo
                                </button>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <button 
                                            className="btn btn-primary w-100"
                                            disabled={carrito.length === 0 || loading}
                                            onClick={() => handlePagar('tarjeta')}
                                        >
                                            <i className="bi bi-credit-card me-1"></i> Tarjeta
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button 
                                            className="btn btn-info text-white w-100"
                                            disabled={carrito.length === 0 || loading}
                                            onClick={() => handlePagar('transferencia')}
                                        >
                                            <i className="bi bi-qr-code me-1"></i> Transf.
                                        </button>
                                    </div>
                                </div>
                                
                                {carrito.length > 0 && (
                                    <button 
                                        className="btn btn-link text-danger text-decoration-none btn-sm mt-1"
                                        onClick={() => setCarrito([])}
                                    >
                                        Vaciar Carrito
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PageWrapper>
    );
}

export default VentasPage;