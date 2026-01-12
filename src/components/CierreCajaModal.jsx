import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { formatCurrencyCLP } from '../utils/formatters';

const CierreCajaModal = ({ show, handleClose }) => {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cargar datos cada vez que se abre el modal
    useEffect(() => {
        if (show) {
            cargarDatosCierre();
        }
    }, [show]);

    const cargarDatosCierre = async () => {
        setLoading(true);
        try {
            // Ajusta la URL si es necesario
            const res = await axios.get('http://localhost:5000/api/reportes/cierre-caja');
            setDatos(res.data);
        } catch (error) {
            console.error("Error cargando cierre", error);
        }
        setLoading(false);
    };

    const imprimirCierre = () => {
        window.print(); // Por ahora impresión simple del navegador
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
                        <p>Calculando totales...</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {/* RESUMEN DE DINERO EN MANO */}
                        <div className="alert alert-info text-center shadow-sm">
                            <h5 className="text-uppercase mb-0">Dinero Esperado en Cajón</h5>
                            <small>(Ventas Efectivo - Gastos)</small>
                            <h1 className="display-4 fw-bold mt-2">
                                {formatCurrencyCLP(datos.dinero_en_caja)}
                            </h1>
                        </div>

                        <div className="row g-3 mt-3">
                            {/* COLUMNA INGRESOS */}
                            <div className="col-md-6">
                                <div className="card h-100 border-success">
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
                                <div className="card h-100 border-danger">
                                    <div className="card-header bg-danger text-white fw-bold">
                                        <i className="bi bi-arrow-down-circle me-2"></i>Egresos (Gastos)
                                    </div>
                                    <div className="card-body text-center d-flex flex-column justify-content-center">
                                        <h3 className="text-danger fw-bold">{formatCurrencyCLP(datos.gastos)}</h3>
                                        <p className="text-muted small">Retiros registrados hoy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                <Button variant="primary" onClick={imprimirCierre} disabled={loading}>
                    <i className="bi bi-printer me-2"></i>Imprimir Reporte
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CierreCajaModal;