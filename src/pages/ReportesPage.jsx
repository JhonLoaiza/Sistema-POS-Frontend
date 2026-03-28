import React, { useState, useEffect } from 'react';
import reporteService from '../services/reporte.service';
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters.js';
import { generarReporteDiarioPDF } from '../utils/pdfGenerator.js';

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
            // Asegurar que todos los campos existan con valores por defecto
            const datosCompletos = {
                fecha: response.data.fecha || fecha,
                total_ventas: response.data.total_ventas || 0,
                ganancia_bruta: response.data.ganancia_bruta || 0,
                compras: response.data.compras || 0,
                gastos: response.data.gastos || 0,
                mermas: response.data.mermas || { valor: 0, cantidad: 0 },
                flujo_caja_neto: response.data.flujo_caja_neto || 0,
                resumen_pagos: response.data.resumen_pagos || []
            };
            setDatos(datosCompletos);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar el reporte.");
            setLoading(false);
        }
    };

    const handleGenerarPDF = () => {
        if (!datos) {
            toast.warning("No hay datos para generar el PDF");
            return;
        }
        try {
            generarReporteDiarioPDF(datos, fecha);
            toast.success("PDF generado exitosamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al generar el PDF");
        }
    };

    return (
        <PageWrapper title="Reporte Diario">
            
            {/* --- Selector de Fecha --- */}
            <div className="row mb-4 g-2">
                <div className="col-12 col-md-auto">
                    <label className="form-label fw-bold mb-2">Fecha del Reporte:</label>
                </div>
                <div className="col-12 col-sm-6 col-md-auto">
                    <input 
                        type="date" 
                        className="form-control w-100"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
                <div className="col-6 col-sm-3 col-md-auto">
                    <button className="btn btn-outline-primary w-100" onClick={cargarReporte}>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        <span className="d-none d-sm-inline">Actualizar</span>
                        <span className="d-inline d-sm-none">Actualizar</span>
                    </button>
                </div>
                <div className="col-6 col-sm-3 col-md-auto ms-md-auto">
                    <button 
                        className="btn btn-danger w-100" 
                        onClick={handleGenerarPDF}
                        disabled={!datos}
                    >
                        <i className="bi bi-file-pdf me-1"></i>
                        <span className="d-none d-sm-inline">Descargar PDF</span>
                        <span className="d-inline d-sm-none">PDF</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : datos ? (
                <div>
                    {/* --- Tarjetas de Resumen --- */}
                    <div className="row mb-4 g-3">
                        {/* Ventas Totales */}
                        <div className="col-12 col-md-4">
                            <div className="card text-white bg-primary h-100 shadow">
                                <div className="card-body text-center py-4">
                                    <h6 className="card-title opacity-75 mb-2">Ventas Totales</h6>
                                    <p className="display-6 fw-bold mb-2">
                                        {formatCurrencyCLP(datos.total_ventas)}
                                    </p>
                                    <small className="d-block">Ingresos brutos del día</small>
                                </div>
                            </div>
                        </div>

                        {/* Ganancia Bruta */}
                        <div className="col-12 col-md-4">
                            <div className="card text-white bg-success h-100 shadow">
                                <div className="card-body text-center py-4">
                                    <h6 className="card-title opacity-75 mb-2">Ganancia Bruta</h6>
                                    <p className="display-6 fw-bold mb-2">
                                        {formatCurrencyCLP(datos.ganancia_bruta)}
                                    </p>
                                    <small className="d-block">Ventas - Costos</small>
                                </div>
                            </div>
                        </div>

                        {/* Flujo de Caja Neto */}
                        <div className="col-12 col-md-4">
                            <div className={`card text-white h-100 shadow ${datos.flujo_caja_neto >= 0 ? 'bg-info' : 'bg-danger'}`}>
                                <div className="card-body text-center py-4">
                                    <h6 className="card-title opacity-75 mb-2">Flujo de Caja Neto</h6>
                                    <p className="display-6 fw-bold mb-2">
                                        {formatCurrencyCLP(datos.flujo_caja_neto)}
                                    </p>
                                    <small className="d-block">Ventas - Egresos</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Sección de Egresos --- */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <h5 className="mb-3"><i className="bi bi-arrow-down-circle text-danger me-2"></i>Egresos del Día</h5>
                            <div className="row g-3">
                                {/* Compras */}
                                <div className="col-12 col-md-4">
                                    <div className="card border-warning h-100">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="flex-grow-1">
                                                    <h6 className="text-muted mb-1">Compras</h6>
                                                    <h4 className="mb-0 text-warning">{formatCurrencyCLP(datos.compras)}</h4>
                                                </div>
                                                <i className="bi bi-cart-plus fs-1 text-warning opacity-50 d-none d-sm-block"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gastos/Retiros */}
                                <div className="col-12 col-md-4">
                                    <div className="card border-danger h-100">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="flex-grow-1">
                                                    <h6 className="text-muted mb-1">Gastos/Retiros</h6>
                                                    <h4 className="mb-0 text-danger">{formatCurrencyCLP(datos.gastos)}</h4>
                                                </div>
                                                <i className="bi bi-wallet2 fs-1 text-danger opacity-50 d-none d-sm-block"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mermas */}
                                <div className="col-12 col-md-4">
                                    <div className="card border-secondary h-100">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="flex-grow-1">
                                                    <h6 className="text-muted mb-1">Mermas</h6>
                                                    <h4 className="mb-0 text-secondary">{formatCurrencyCLP(datos.mermas.valor)}</h4>
                                                    <small className="text-muted">{datos.mermas.cantidad} unidades</small>
                                                </div>
                                                <i className="bi bi-trash fs-1 text-secondary opacity-50 d-none d-sm-block"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Tabla de Desglose por Pago --- */}
                    <h5 className="mb-3"><i className="bi bi-cash-stack text-success me-2"></i>Desglose por Método de Pago</h5>
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