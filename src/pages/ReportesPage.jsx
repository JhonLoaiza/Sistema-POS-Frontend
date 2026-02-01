import React, { useState, useEffect } from 'react';
import reporteService from '../services/reporte.service';
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters.js';

const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm h-100">
        <div className="card-header bg-white py-3">
            <h4 className="mb-0 text-primary"><i className="bi bi-bar-chart-line me-2"></i>{title}</h4>
        </div>
        <div className="card-body">
            {children}
        </div>
    </div>
);

function ReportesPage() {
    // 1. Estado para la fecha. Por defecto: HOY.
    // Truco para obtener YYYY-MM-DD local:
    const hoy = new Date().toLocaleDateString('en-CA'); 
    const [fecha, setFecha] = useState(hoy);
    
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);

    // 2. Cargar reporte cuando cambia la fecha
    useEffect(() => {
        cargarReporte();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha]); // <-- Se ejecuta cada vez que cambias la fecha

    const cargarReporte = async () => {
        try {
            setLoading(true);
            const response = await reporteService.getReporteDiario(fecha);
            setDatos(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar el reporte.");
            setLoading(false);
        }
    };

    return (
        <PageWrapper title="Reporte Diario">
            
            {/* --- Selector de Fecha --- */}
            <div className="row mb-4 align-items-center">
                <div className="col-auto">
                    <label className="form-label fw-bold me-2">Fecha del Reporte:</label>
                </div>
                <div className="col-auto">
                    <input 
                        type="date" 
                        className="form-control"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
                <div className="col-auto">
                    <button className="btn btn-outline-primary" onClick={cargarReporte}>
                        <i className="bi bi-arrow-clockwise"></i> Actualizar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : datos ? (
                <div>
                    {/* --- Tarjetas de Resumen --- */}
                    <div className="row mb-4">
                        {/* Ventas Totales */}
                        <div className="col-md-6 mb-3">
                            <div className="card text-white bg-primary h-100 shadow">
                                <div className="card-body text-center">
                                    <h5 className="card-title opacity-75">Ventas Totales</h5>
                                    <p className="display-4 fw-bold mb-0">
                                        {formatCurrencyCLP(datos.total_ventas)}
                                    </p>
                                    <small>Ingresos brutos del día</small>
                                </div>
                            </div>
                        </div>

                        {/* Ganancia (Solo Lorena la ve) */}
                        <div className="col-md-6 mb-3">
                            <div className="card text-white bg-success h-100 shadow">
                                <div className="card-body text-center">
                                    <h5 className="card-title opacity-75">Ganancia Estimada</h5>
                                    <p className="display-4 fw-bold mb-0">
                                        {formatCurrencyCLP(datos.ganancia_bruta)}
                                    </p>
                                    <small>Ventas - Costos</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Tabla de Desglose por Pago --- */}
                    <h5 className="mb-3">Desglose por Método de Pago</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead className="table-light">
                                <tr>
                                    <th>Método</th>
                                    <th className="text-end">Total Recibido</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datos.resumen_pagos.length > 0 ? (
                                    datos.resumen_pagos.map((pago, index) => (
                                        <tr key={index}>
                                            <td className="text-capitalize">
                                                {/* Iconos dinámicos */}
                                                {pago.metodo_pago === 'efectivo' && <i className="bi bi-cash-coin me-2 text-success"></i>}
                                                {pago.metodo_pago === 'tarjeta' && <i className="bi bi-credit-card me-2 text-primary"></i>}
                                                {pago.metodo_pago === 'transferencia' && <i className="bi bi-qr-code me-2 text-info"></i>}
                                                {pago.metodo_pago}
                                            </td>
                                            <td className="text-end fw-bold">
                                                {formatCurrencyCLP(pago.total_por_metodo)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            No hubo ventas registradas en esta fecha.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-muted">Selecciona una fecha para ver los datos.</p>
            )}
        </PageWrapper>
    );
}

export default ReportesPage;