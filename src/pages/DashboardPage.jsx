import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productoService from '../services/producto.service';
import reporteService from '../services/reporte.service';
import { formatCurrencyCLP } from '../utils/formatters.js';

const DashboardPage = () => {
    const [resumenVentas, setResumenVentas] = useState(null);
    const [productosBajoStock, setProductosBajoStock] = useState([]);
    const [totalProductos, setTotalProductos] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function cargarDatosDashboard() {
            try {
                setLoading(true);
                
                // 1. Obtenemos la fecha de hoy (YYYY-MM-DD) en local
                const hoy = new Date().toLocaleDateString('en-CA');

                // 2. Hacemos las dos peticiones al mismo tiempo (Promise.all es más rápido)
                const [reporteResp, productosResp] = await Promise.all([
                    reporteService.getReporteDiario(hoy),
                    productoService.getProductos()
                ]);

                // 3. Guardamos datos de ventas
                setResumenVentas(reporteResp.data);

                // 4. Calculamos métricas de productos
                const todosLosProductos = productosResp.data;
                setTotalProductos(todosLosProductos.length);

                // Filtramos los que tienen stock crítico
                const criticos = todosLosProductos.filter(p => p.stock <= p.stock_minimo);
                setProductosBajoStock(criticos);

                setLoading(false);
            } catch (error) {
                console.error("Error cargando dashboard", error);
                setLoading(false);
            }
        }

        cargarDatosDashboard();
    }, []);

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    return (
        <div>
            <h2 className="mb-4 fw-bold text-dark">Panel de Control</h2>

            {/* --- SECCIÓN 1: Tarjetas de Resumen (KPIs) --- */}
            <div className="row mb-4">
                
                {/* Tarjeta: Ventas de Hoy */}
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body position-relative">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-uppercase fw-bold text-muted mb-0">Ventas de Hoy</h6>
                                <i className="bi bi-cash-coin fs-4 text-success opacity-50"></i>
                            </div>
                            <h3 className="fw-bold mb-0">
                                {resumenVentas ? formatCurrencyCLP(resumenVentas.total_ventas) : '$0'}
                            </h3>
                            <small className="text-muted">Ingresos brutos</small>
                        </div>
                        <div className="card-footer bg-success bg-opacity-10 border-0 py-2">
                            <Link to="/reportes" className="text-success text-decoration-none small fw-bold">
                                Ver detalles <i className="bi bi-arrow-right ms-1"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Productos Críticos */}
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body position-relative">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-uppercase fw-bold text-muted mb-0">Stock Crítico</h6>
                                <i className="bi bi-exclamation-triangle fs-4 text-danger opacity-50"></i>
                            </div>
                            <h3 className="fw-bold mb-0 text-danger">
                                {productosBajoStock.length}
                            </h3>
                            <small className="text-muted">Productos por agotar</small>
                        </div>
                        <div className="card-footer bg-danger bg-opacity-10 border-0 py-2">
                            <Link to="/inventario" className="text-danger text-decoration-none small fw-bold">
                                Ir a inventario <i className="bi bi-arrow-right ms-1"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Tarjeta: Total Inventario */}
                <div className="col-md-4 mb-3">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body position-relative">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-uppercase fw-bold text-muted mb-0">Total Productos</h6>
                                <i className="bi bi-box-seam fs-4 text-primary opacity-50"></i>
                            </div>
                            <h3 className="fw-bold mb-0">
                                {totalProductos}
                            </h3>
                            <small className="text-muted">Registrados en sistema</small>
                        </div>
                        <div className="card-footer bg-primary bg-opacity-10 border-0 py-2">
                            <Link to="/inventario" className="text-primary text-decoration-none small fw-bold">
                                Ver todos <i className="bi bi-arrow-right ms-1"></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: Tabla de Alertas --- */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-bold text-danger">
                        <i className="bi bi-bell me-2"></i>Alertas de Stock Bajo
                    </h5>
                </div>
                <div className="card-body p-0">
                    {productosBajoStock.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="bi bi-check-circle fs-1 d-block mb-2 text-success"></i>
                            ¡Todo en orden! No hay productos con stock bajo.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Producto</th>
                                        <th>Stock Actual</th>
                                        <th>Mínimo</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosBajoStock.map(p => (
                                        <tr key={p.id}>
                                            <td className="fw-bold text-dark">{p.nombre}</td>
                                            <td className="fw-bold text-danger">{p.stock}</td>
                                            <td className="text-muted">{p.stock_minimo}</td>
                                            <td>
                                                {p.stock === 0 ? (
                                                    <span className="badge bg-danger">Agotado</span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark">Por agotar</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;