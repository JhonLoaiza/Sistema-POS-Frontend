import React, { useState, useEffect } from 'react';
import productoService from '../services/producto.service';
import ventaService from '../services/venta.service';
import { toast } from 'react-toastify'; 
import { formatCurrencyCLP } from '../utils/formatters.js';
import TicketModal from '../components/TicketModal.jsx';
// IMPORTAMOS EL NUEVO MODAL DE GASTOS
import GastoModal from '../components/GastoModal.jsx';
// IMPORTAMOS EL MODAL DE CIERRE DE CAJA
import CierreCajaModal from '../components/CierreCajaModal.jsx';

const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm h-100">
        <div className="card-header bg-white py-3">
            <h4 className="mb-0 text-primary"><i className="bi bi-cart3 me-2"></i>{title}</h4>
        </div>
        <div className="card-body p-0 p-md-3">
            {children || <p>Cargando...</p>}
        </div>
    </div>
);

function VentasPage() {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados Modales
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showGastoModal, setShowGastoModal] = useState(false); 
    const [showCierreModal, setShowCierreModal] = useState(false); 
    
    const [ultimoCarrito, setUltimoCarrito] = useState([]); 
    const [ultimoTotal, setUltimoTotal] = useState(0);

    useEffect(() => { cargarProductos(); }, []);

    const cargarProductos = async () => {
        try {
            const response = await productoService.getProductos();
            setProductos(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar inventario");
            setLoading(false);
        }
    };

    // --- FIX: FUNCIÓN PARA GESTIONAR LAS IMÁGENES (Cloudinary vs Local) ---
    const getImagenUrl = (imagen) => {
        if (!imagen) return null;
        
        // 1. Si es de Cloudinary (empieza con http), usar tal cual
        if (imagen.startsWith('http')) return imagen;

        // 2. Si es local, construir URL basada en variable de entorno
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const SERVER_URL = API_URL.replace('/api', '');
        
        return `${SERVER_URL}/${imagen}`;
    };

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.includes(filtro))
    );

    const totalVenta = carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);

    const agregarAlCarrito = (producto) => {
        const itemEnCarrito = carrito.find(item => item.id === producto.id);
        const cantidadActual = itemEnCarrito ? itemEnCarrito.cantidad : 0;
        if (cantidadActual >= producto.stock) {
            toast.warning(`Stock insuficiente`);
            return;
        }
        if (itemEnCarrito) {
            setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
        } else {
            setCarrito([...carrito, { ...producto, cantidad: 1 }]);
        }
    };

    const restarDelCarrito = (producto) => {
        if (producto.cantidad === 1) eliminarDelCarrito(producto.id);
        else setCarrito(carrito.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad - 1 } : item));
    };

    const eliminarDelCarrito = (id) => setCarrito(carrito.filter(item => item.id !== id));

    const handlePagar = async (metodoPago) => {
        if (carrito.length === 0) return;
        try {
            const ventaData = {
                carrito: carrito.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad,
                    precio: item.precio_venta,
                    total: item.precio_venta * item.cantidad
                })),
                total: totalVenta,
                metodo_pago: metodoPago
            };
            
            await ventaService.crearVenta(ventaData);
            
            setUltimoCarrito([...carrito]); 
            setUltimoTotal(totalVenta);
            setShowTicketModal(true); 
            toast.success(`Venta registrada`);
        } catch (error) {
            console.error(error);
            alert("Error al vender: " + (error.response?.data?.message || error.message));
        }
    };

    const handleCerrarTicket = () => {
        setShowTicketModal(false);
        setCarrito([]);
        setFiltro('');
        cargarProductos();
    };

    return (
        <PageWrapper title="Punto de Venta">
            <div className="row h-100">
                {/* IZQUIERDA: Productos */}
                <div className="col-md-7 d-flex flex-column h-100">
                    <div className="input-group mb-3">
                        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                        <input type="text" className="form-control form-control-lg" placeholder="Buscar..." value={filtro} onChange={(e) => setFiltro(e.target.value)} autoFocus />
                    </div>
                    <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '70vh' }}>
                        {loading ? (
                            <div className="text-center mt-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="list-group">
                                {productosFiltrados.map(p => (
                                    <button key={p.id} className={`list-group-item list-group-item-action d-flex align-items-center p-2 ${p.stock <= 0 ? 'disabled bg-light' : ''}`} onClick={() => agregarAlCarrito(p)} disabled={p.stock <= 0}>
                                        <div className="me-3">
                                            {/* --- AQUI APLICAMOS LA CORRECCIÓN DE IMAGEN --- */}
                                            {p.imagen ? (
                                                <img 
                                                    src={getImagenUrl(p.imagen)} 
                                                    alt={p.nombre} 
                                                    className="rounded border" 
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/60?text=Error"; }}
                                                />
                                            ) : (
                                                <div className="bg-light d-flex align-items-center rounded border" style={{width:'60px', height:'60px', justifyContent:'center'}}>
                                                    <i className="bi bi-box-seam text-muted fs-4"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow-1 text-start">
                                            <div className="d-flex justify-content-between">
                                                <h6 className="mb-0 fw-bold text-truncate" style={{maxWidth: '200px'}}>{p.nombre}</h6>
                                                <span className="badge bg-primary rounded-pill">{formatCurrencyCLP(p.precio_venta)}</span>
                                            </div>
                                            <small className={p.stock > 5 ? "text-success" : "text-danger"}>Stock: {p.stock}</small>
                                        </div>
                                    </button>
                                ))}
                                {productosFiltrados.length === 0 && (
                                    <div className="text-center p-4 text-muted">No se encontraron productos.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* DERECHA: Carrito */}
                <div className="col-md-5 mt-3 mt-md-0">
                    <div className="card shadow border-0 h-100 d-flex flex-column">
                        <div className="card-header bg-light fw-bold">Carrito</div>
                        <div className="card-body p-0 flex-grow-1 overflow-auto" style={{ maxHeight: '50vh' }}>
                            <ul className="list-group list-group-flush">
                                {carrito.length === 0 ? <div className="text-center py-5 text-muted">Carrito vacío</div> : carrito.map(item => (
                                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div><div className="fw-bold">{item.nombre}</div><small className="text-muted">{item.cantidad} x {formatCurrencyCLP(item.precio_venta)}</small></div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-bold text-primary">{formatCurrencyCLP(item.precio_venta * item.cantidad)}</span>
                                            <div className="btn-group btn-group-sm">
                                                <button className="btn btn-outline-secondary" onClick={(e) => {e.stopPropagation(); restarDelCarrito(item)}}><i className="bi bi-dash"></i></button>
                                                <button className="btn btn-outline-secondary disabled text-dark fw-bold" style={{width:'30px'}}>{item.cantidad}</button>
                                                <button className="btn btn-outline-secondary" onClick={(e) => {e.stopPropagation(); agregarAlCarrito(item)}} disabled={item.cantidad >= item.stock}><i className="bi bi-plus"></i></button>
                                            </div>
                                            <button className="btn btn-sm btn-outline-danger" onClick={(e) => {e.stopPropagation(); eliminarDelCarrito(item.id)}}><i className="bi bi-trash"></i></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="card-footer bg-white border-top p-3">
                            <div className="d-flex justify-content-between mb-3">
                                <span className="fs-4">Total:</span>
                                <span className="fs-3 fw-bold text-primary">{formatCurrencyCLP(totalVenta)}</span>
                            </div>
                            
                            {/* --- BOTÓN DE GASTOS --- */}
                            <button className="btn btn-outline-danger w-100 mb-2" onClick={() => setShowGastoModal(true)}>
                                <i className="bi bi-dash-circle me-2"></i> Registrar Gasto / Retiro
                            </button>

                            {/* --- NUEVO BOTÓN: CIERRE DE CAJA --- */}
                            <button className="btn btn-dark w-100 mb-3" onClick={() => setShowCierreModal(true)}>
                                <i className="bi bi-calculator me-2"></i> Cierre de Caja
                            </button>

                            <div className="d-grid gap-2">
                                <button className="btn btn-success btn-lg" disabled={carrito.length === 0} onClick={() => handlePagar('efectivo')}><i className="bi bi-cash-coin me-2"></i> Pagar Efectivo</button>
                                <div className="row g-2">
                                    <div className="col-6"><button className="btn btn-primary w-100" disabled={carrito.length === 0} onClick={() => handlePagar('tarjeta')}><i className="bi bi-credit-card me-1"></i> Tarjeta</button></div>
                                    <div className="col-6"><button className="btn btn-info text-white w-100" disabled={carrito.length === 0} onClick={() => handlePagar('transferencia')}><i className="bi bi-qr-code me-1"></i> Transf.</button></div>
                                </div>
                                {carrito.length > 0 && <button className="btn btn-link text-danger w-100 mt-2 text-decoration-none btn-sm" onClick={() => setCarrito([])}>Vaciar Carrito</button>}
                            </div>
                        </div>
                    </div>
                </div>

                <TicketModal show={showTicketModal} handleClose={() => setShowTicketModal(false)} items={ultimoCarrito} total={ultimoTotal} onNuevaVenta={handleCerrarTicket} />
                
                {/* MODAL DE GASTOS */}
                <GastoModal show={showGastoModal} handleClose={() => setShowGastoModal(false)} />

                {/* MODAL DE CIERRE DE CAJA */}
                <CierreCajaModal show={showCierreModal} handleClose={() => setShowCierreModal(false)} />
            </div>
        </PageWrapper>
    );
}

export default VentasPage;