import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import productoService from '../services/producto.service';
import reporteService from '../services/reporte.service';
import { formatCurrencyCLP } from '../utils/formatters.js';

// Registrar componentes de gráficos
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardPage = () => {
    // Inicializamos con valores seguros para evitar errores de "null"
    const [resumenVentas, setResumenVentas] = useState({ total_ventas: 0 });
    const [productosBajoStock, setProductosBajoStock] = useState([]);
    const [totalProductos, setTotalProductos] = useState(0);
    const [rankings, setRankings] = useState({ top: [], menos: [], sinMovimiento: [] });
    const [ventasSemana, setVentasSemana] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatosBlindados();
    }, []);

    const cargarDatosBlindados = async () => {
        setLoading(true);
        const hoy = new Date().toLocaleDateString('en-CA');
        
        // --- 1. CARGAR INVENTARIO (Vital) ---
        try {
            const prodResp = await productoService.getProductos();
            const todos = prodResp.data || [];
            setTotalProductos(todos.length);

            // Lógica Mejorada: Si stock_minimo no está definido, avisar si baja de 5
            const criticos = todos.filter(p => {
                const stockActual = parseInt(p.stock, 10) || 0;
                const stockMinimo = (p.stock_minimo !== null && p.stock_minimo > 0) 
                                    ? parseInt(p.stock_minimo, 10) 
                                    : 5; // Umbral por defecto
                return stockActual <= stockMinimo;
            });
            setProductosBajoStock(criticos);
        } catch (error) {
            console.error("❌ Error cargando Inventario:", error);
        }

        // --- 2. CARGAR VENTAS DEL DÍA ---
        try {
            const reporteResp = await reporteService.getReporteDiario(hoy);
            if(reporteResp.data) setResumenVentas(reporteResp.data);
        } catch (error) {
            console.error("❌ Error cargando Ventas Hoy:", error);
        }

        // --- 3. CARGAR GRÁFICOS (Si fallan, no rompen el resto) ---
        try {
            const rankResp = await reporteService.getRankings();
            if(rankResp.data) setRankings(rankResp.data);
        } catch (error) {
            console.warn("⚠️ Error cargando Rankings:", error);
        }

        try {
            const semanaResp = await reporteService.getVentasSemana();
            if(semanaResp.data) setVentasSemana(semanaResp.data);
        } catch (error) {
            console.warn("⚠️ Error cargando Semanal:", error);
        }

        setLoading(false);
    };

    // --- CONFIGURACIÓN VISUAL GRÁFICAS ---
    const dataBarras = {
        labels: ventasSemana.map(v => {
             // Manejo seguro de fecha
             const fechaParts = v.fecha_venta ? v.fecha_venta.split('-') : ['00','00','00'];
             const [, m, d] = fechaParts; 
             return `${d}/${m}`;
        }),
        datasets: [{
            label: 'Ventas ($)',
            data: ventasSemana.map(v => v.total),
            backgroundColor: '#0d6efd',
            borderRadius: 5,
        }],
    };

    const opcionesBarras = {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: true, text: 'Ventas de la Semana' } },
        scales: { x: { grid: { display: false } }, y: { grid: { borderDash: [5, 5] } } }
    };

    const dataDona = {
        labels: rankings.top.map(p => p.nombre),
        datasets: [{
            data: rankings.top.map(p => p.total),
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
            borderWidth: 0,
        }],
    };

    if (loading) return (
        <div className="d-flex flex-column align-items-center justify-content-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Cargando panel de control...</p>
        </div>
    );

    return (
        <div className="p-4 bg-light min-vh-100">
            <h2 className="mb-4 fw-bold text-dark"><i className="bi bi-speedometer2 me-2"></i>Panel de Control</h2>

            {/* --- 1. TARJETAS DE RESUMEN --- */}
            <div className="row mb-4">
                {/* Ventas Hoy */}
                <div className="col-md-4 mb-3">
                    <div className="card text-white h-100 border-0 shadow" style={{ background: 'linear-gradient(45deg, #198754, #20c997)' }}>
                        <div className="card-body position-relative overflow-hidden">
                            <div className="position-relative z-1">
                                <h6 className="text-uppercase opacity-75 mb-1">Ventas Hoy</h6>
                                <h2 className="fw-bold display-6 mb-0">
                                    {formatCurrencyCLP(resumenVentas.total_ventas || 0)}
                                </h2>
                                <Link to="/reportes" className="text-white text-decoration-none small mt-2 d-inline-block opacity-75">Ver detalle <i className="bi bi-arrow-right"></i></Link>
                            </div>
                            <i className="bi bi-cash-coin position-absolute top-50 end-0 translate-middle-y me-3 text-white" style={{ fontSize: '5rem', opacity: 0.2 }}></i>
                        </div>
                    </div>
                </div>

                {/* Stock Crítico */}
                <div className="col-md-4 mb-3">
                    <div className="card text-white h-100 border-0 shadow" style={{ background: 'linear-gradient(45deg, #dc3545, #ff6b6b)' }}>
                        <div className="card-body position-relative overflow-hidden">
                            <div className="position-relative z-1">
                                <h6 className="text-uppercase opacity-75 mb-1">Stock Crítico</h6>
                                <h2 className="fw-bold display-6 mb-0">{productosBajoStock.length}</h2>
                                <Link to="/inventario" className="text-white text-decoration-none small mt-2 d-inline-block opacity-75">Gestionar <i className="bi bi-arrow-right"></i></Link>
                            </div>
                            <i className="bi bi-exclamation-triangle position-absolute top-50 end-0 translate-middle-y me-3 text-white" style={{ fontSize: '5rem', opacity: 0.2 }}></i>
                        </div>
                    </div>
                </div>

                {/* Inventario */}
                <div className="col-md-4 mb-3">
                    <div className="card text-white h-100 border-0 shadow" style={{ background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)' }}>
                        <div className="card-body position-relative overflow-hidden">
                            <div className="position-relative z-1">
                                <h6 className="text-uppercase opacity-75 mb-1">Inventario</h6>
                                <h2 className="fw-bold display-6 mb-0">{totalProductos}</h2>
                                <Link to="/inventario" className="text-white text-decoration-none small mt-2 d-inline-block opacity-75">Ver todo <i className="bi bi-arrow-right"></i></Link>
                            </div>
                            <i className="bi bi-box-seam position-absolute top-50 end-0 translate-middle-y me-3 text-white" style={{ fontSize: '5rem', opacity: 0.2 }}></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. GRÁFICAS --- */}
            <div className="row mb-4">
                <div className="col-lg-8 mb-3">
                    <div className="card border-0 shadow h-100">
                        <div className="card-body">
                            {ventasSemana.length > 0 ? (
                                <Bar data={dataBarras} options={opcionesBarras} />
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <i className="bi bi-bar-chart-line fs-1 mb-2 d-block opacity-25"></i>
                                    Aún no hay suficientes ventas esta semana para graficar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 mb-3">
                    <div className="card border-0 shadow h-100">
                        <div className="card-header bg-white border-0 fw-bold pt-3">Top 5 Productos</div>
                        <div className="card-body d-flex align-items-center justify-content-center">
                            {rankings.top.length > 0 ? (
                                <div style={{ maxHeight: '220px', width: '100%' }}>
                                    <Doughnut data={dataDona} options={{ plugins: { legend: { position: 'bottom' } } }} />
                                </div>
                            ) : (
                                <div className="text-center text-muted">
                                    <i className="bi bi-pie-chart fs-1 mb-2 d-block opacity-25"></i>
                                    Sin ventas registradas.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. LISTAS DETALLADAS --- */}
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="card border-0 shadow h-100">
                        <div className="card-header bg-warning bg-opacity-10 fw-bold text-dark border-0">Menos Vendidos</div>
                        <ul className="list-group list-group-flush">
                            {rankings.menos.map((p, i) => (
                                <li key={i} className="list-group-item border-0 d-flex justify-content-between px-4 py-3">
                                    <span>{p.nombre}</span>
                                    <span className="badge bg-warning text-dark rounded-pill">{p.total} un.</span>
                                </li>
                            ))}
                            {rankings.menos.length === 0 && <li className="list-group-item border-0 text-center text-muted py-4">Sin datos</li>}
                        </ul>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="card border-0 shadow h-100">
                        <div className="card-header bg-secondary bg-opacity-10 fw-bold text-dark border-0">Sin Movimiento</div>
                        <ul className="list-group list-group-flush">
                            {rankings.sinMovimiento.map((p, i) => (
                                <li key={i} className="list-group-item border-0 d-flex justify-content-between px-4 py-3">
                                    <span>{p.nombre}</span>
                                    <span className="badge bg-light text-secondary border">Stock: {p.stock}</span>
                                </li>
                            ))}
                            {rankings.sinMovimiento.length === 0 && <li className="list-group-item border-0 text-center text-muted py-4">Todo el inventario se mueve.</li>}
                        </ul>
                    </div>
                </div>
            </div>

            {/* --- 4. ALERTAS DE STOCK --- */}
            {productosBajoStock.length > 0 ? (
                <div className="card border-0 shadow border-start border-5 border-danger mb-4">
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="mb-0 fw-bold text-danger">
                            <i className="bi bi-bell-fill me-2 swing-animation"></i>Atención Requerida
                        </h5>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Producto</th>
                                    <th className="text-center">Stock</th>
                                    <th className="text-center">Mínimo Sugerido</th>
                                    <th className="text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosBajoStock.map(p => (
                                    <tr key={p.id}>
                                        <td className="ps-4 fw-bold">{p.nombre}</td>
                                        <td className="text-center text-danger fw-bold">{p.stock}</td>
                                        <td className="text-center text-muted small">{p.stock_minimo || 5}</td>
                                        <td className="text-center"><span className="badge bg-danger">Reponer</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="card border-0 shadow mb-4">
                    <div className="card-body text-center py-4 text-success">
                         <i className="bi bi-check-circle-fill fs-3 mb-2 d-block"></i>
                         ¡Excelente! No tienes productos con stock crítico.
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;