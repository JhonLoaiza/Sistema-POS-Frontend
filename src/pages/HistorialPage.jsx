import React, { useState, useEffect } from 'react';
import ventaService from '../services/venta.service';
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters';

const HistorialPage = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- 1. Nuevos estados para Paginación ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // --- 2. Cargar ventas cuando cambia la página ---
    useEffect(() => {
        cargarVentas(page);
    }, [page]); 

    const cargarVentas = async (paginaActual) => {
        try {
            setLoading(true);
            // Llamamos al servicio pasando el número de página
            const res = await ventaService.getVentas(paginaActual);
            
            // --- 3. Ajustamos para leer la nueva estructura del backend ---
            // Backend devuelve: { data: [...ventas], pagination: { totalPages: X, ... } }
            if (res.data && res.data.data) {
                setVentas(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            } else {
                // Fallback por si el backend aún no se actualizó
                setVentas(Array.isArray(res.data) ? res.data : []);
            }
            
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando historial");
            setLoading(false);
        }
    };

    const handleAnular = async (id) => {
        if (!window.confirm("¿Seguro que quieres anular esta venta? El stock se devolverá al inventario.")) return;

        try {
            await ventaService.anularVenta(id);
            toast.success("Venta anulada y stock recuperado");
            cargarVentas(page); // Recargamos la página actual
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error al anular venta");
        }
    };

    // --- 4. Funciones de Navegación ---
    const handlePrev = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><i className="bi bi-clock-history me-2"></i>Historial de Ventas</h2>
                <button className="btn btn-outline-primary btn-sm" onClick={() => cargarVentas(page)}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
                </button>
            </div>
            
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Fecha / Hora</th>
                                    <th>Detalle</th>
                                    <th>Método</th>
                                    <th className="text-end">Total</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : ventas.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No hay ventas registradas.</td></tr>
                                ) : ventas.map(venta => (
                                    <tr key={venta.id}>
                                        <td className="ps-4 text-muted fw-bold">#{venta.id}</td>
                                        <td>
                                            <div className="fw-bold">{new Date(venta.fecha).toLocaleDateString()}</div>
                                            <small className="text-muted">
                                                {new Date(venta.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {venta.cantidad_items || 0} productos
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                venta.metodo_pago === 'efectivo' ? 'bg-success' : 
                                                venta.metodo_pago === 'tarjeta' ? 'bg-primary' : 'bg-info text-dark'
                                            }`}>
                                                {venta.metodo_pago ? venta.metodo_pago.toUpperCase() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold fs-5 text-dark">
                                            {formatCurrencyCLP(venta.total)}
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleAnular(venta.id)}
                                                title="Anular venta y devolver stock"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- 5. CONTROLES DE PAGINACIÓN (Footer) --- */}
                {!loading && ventas.length > 0 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
                        <span className="text-muted small">
                            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
                        </span>
                        
                        <nav aria-label="Navegación de ventas">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={handlePrev}>
                                        <span aria-hidden="true">&laquo; Anterior</span>
                                    </button>
                                </li>
                                
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={handleNext}>
                                        <span aria-hidden="true">Siguiente &raquo;</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialPage;