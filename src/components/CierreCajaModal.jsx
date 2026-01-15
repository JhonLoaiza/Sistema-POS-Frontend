import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import reporteService from '../services/reporte.service'; 
import { formatCurrencyCLP } from '../utils/formatters';
import { toast } from 'react-toastify';

const CierreCajaModal = ({ show, handleClose }) => {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Mover todo adentro del useEffect soluciona el warning ---
    useEffect(() => {
        // 1. Definimos la función auxiliar para la fecha aquí mismo
        const getFechaLocal = () => {
            const ahora = new Date();
            const year = ahora.getFullYear();
            const month = String(ahora.getMonth() + 1).padStart(2, '0');
            const day = String(ahora.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // 2. Definimos la función de carga aquí mismo
        const cargarDatosCierre = async () => {
            setLoading(true);
            try {
                // Usamos la fecha local calculada
                const fechaHoy = getFechaLocal();
                const res = await reporteService.getCierreCaja(fechaHoy);
                setDatos(res.data);
            } catch (error) {
                console.error("Error cargando cierre", error);
                if (error.response && error.response.status === 401) {
                    toast.error("Tu sesión ha expirado.");
                    handleClose();
                } else {
                    toast.error("Error al calcular el cierre de caja.");
                }
            }
            setLoading(false);
        };

        // 3. Ejecutamos solo si el modal se está mostrando
        if (show) {
            cargarDatosCierre();
        }

        // El array de dependencias ahora solo necesita 'show' y 'handleClose'
    }, [show, handleClose]);

    const imprimirCierre = () => {
        window.print(); 
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title><i className="bi bi-calculator me-2"></i>Cierre de Caja (Hoy)</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading || !datos ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                        <p className="mt-2 text-muted">Calculando totales del día...</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {/* RESUMEN DE DINERO EN MANO */}
                        <div className="alert alert-info text-center shadow-sm">
                            <h5 className="text-uppercase mb-0">Dinero Esperado en Cajón</h5>
                            <small className="text-muted">(Ventas Efectivo - Gastos)</small>
                            <h1 className="display-4 fw-bold mt-2 text-dark">
                                {formatCurrencyCLP(datos.dinero_en_caja)}
                            </h1>
                        </div>

                        <div className="row g-3 mt-3">
                            {/* COLUMNA INGRESOS */}
                            <div className="col-md-6">
                                <div className="card h-100 border-success shadow-sm">
                                    <div className="card-header bg-success text-white fw-bold">
                                        <i className="bi bi-arrow-up-circle me-2"></i>Ingresos (Ventas)
                                    </div>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Efectivo:</span>
                                            <span className="fw-bold text-success">{formatCurrencyCLP(datos.ventas.total_efectivo)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Tarjeta:</span>
                                            <span className="fw-bold text-primary">{formatCurrencyCLP(datos.ventas.total_tarjeta)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Transferencia:</span>
                                            <span className="fw-bold text-info">{formatCurrencyCLP(datos.ventas.total_transferencia)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between bg-light fw-bold">
                                            <span>TOTAL VENDIDO:</span>
                                            <span>{formatCurrencyCLP(datos.ventas.gran_total)}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* COLUMNA EGRESOS */}
                            <div className="col-md-6">
                                <div className="card h-100 border-danger shadow-sm">
                                    <div className="card-header bg-danger text-white fw-bold">
                                        <i className="bi bi-arrow-down-circle me-2"></i>Egresos (Gastos)
                                    </div>
                                    <div className="card-body text-center d-flex flex-column justify-content-center">
                                        <h3 className="text-danger fw-bold">{formatCurrencyCLP(datos.gastos)}</h3>
                                        <p className="text-muted small mb-0">Retiros registrados hoy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                <Button variant="primary" onClick={imprimirCierre} disabled={loading || !datos}>
                    <i className="bi bi-printer me-2"></i>Imprimir Reporte
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CierreCajaModal;