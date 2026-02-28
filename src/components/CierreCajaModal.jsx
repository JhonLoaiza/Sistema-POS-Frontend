import React, { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import cierreCajaService from '../services/cierreCaja.service';
import { formatCurrencyCLP } from '../utils/formatters';
import { generarCierreCajaPDF } from '../utils/pdfGenerator';
import { toast } from 'react-toastify';

const CierreCajaModal = ({ show, handleClose }) => {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [efectivoReal, setEfectivoReal] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [diferencia, setDiferencia] = useState(0);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargarDatosCierre = async () => {
            setLoading(true);
            try {
                const res = await cierreCajaService.obtenerDatos();
                setDatos(res.data);
                // Limpiar campos al cargar
                setEfectivoReal('');
                setObservaciones('');
                setDiferencia(0);
            } catch (error) {
                console.error('Error cargando cierre', error);
                if (error.response && error.response.status === 401) {
                    toast.error('Tu sesión ha expirado.');
                    handleClose();
                } else {
                    toast.error('Error al calcular el cierre de caja.');
                }
            }
            setLoading(false);
        };

        if (show) {
            cargarDatosCierre();
        }
    }, [show, handleClose]);

    // Calcular diferencia cuando cambia el efectivo real
    useEffect(() => {
        if (datos && efectivoReal !== '') {
            const real = parseFloat(efectivoReal) || 0;
            const esperado = parseFloat(datos.efectivo_esperado) || 0;
            setDiferencia(real - esperado);
        } else {
            setDiferencia(0);
        }
    }, [efectivoReal, datos]);

    const handleRegistrarCierre = async () => {
        // Validaciones
        if (!efectivoReal || efectivoReal === '') {
            toast.error('Debes ingresar el dinero real contado');
            return;
        }

        const diferenciaAbs = Math.abs(diferencia);
        if (diferenciaAbs > 1000 && (!observaciones || observaciones.trim() === '')) {
            toast.error('Diferencia mayor a $1.000 requiere observaciones');
            return;
        }

        setGuardando(true);
        try {
            const datosCierre = {
                fecha: datos.fecha,
                efectivo_esperado: datos.efectivo_esperado,
                tarjeta_total: datos.tarjeta,
                transferencia_total: datos.transferencia,
                total_ventas: datos.total_ventas,
                total_gastos: datos.total_gastos,
                efectivo_real: parseFloat(efectivoReal),
                observaciones: observaciones.trim() || null
            };

            const res = await cierreCajaService.registrarCierre(datosCierre);
            toast.success(res.data.mensaje);
            
            // Generar PDF automáticamente
            generarCierreCajaPDF({
                ...datos,
                efectivo_real: parseFloat(efectivoReal),
                diferencia,
                observaciones: observaciones.trim()
            });

            handleClose();
        } catch (error) {
            console.error('Error al registrar cierre:', error);
            toast.error('Error al registrar el cierre de caja');
        }
        setGuardando(false);
    };

    const getDiferenciaColor = () => {
        if (diferencia === 0) return 'success';
        if (diferencia > 0) return 'info';
        return 'danger';
    };

    const getDiferenciaTexto = () => {
        if (diferencia === 0) return 'Cuadrado ✓';
        if (diferencia > 0) return `Sobrante: ${formatCurrencyCLP(Math.abs(diferencia))}`;
        return `Faltante: ${formatCurrencyCLP(Math.abs(diferencia))}`;
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title><i className="bi bi-calculator me-2"></i>Cierre de Caja</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading || !datos ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                        <p className="mt-2 text-muted">Calculando totales del día...</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {/* RESUMEN DE DINERO ESPERADO */}
                        <div className="alert alert-info text-center shadow-sm">
                            <h5 className="text-uppercase mb-0">Efectivo Esperado en Cajón</h5>
                            <small className="text-muted">(Ventas Efectivo - Gastos)</small>
                            <h1 className="display-4 fw-bold mt-2 text-dark">
                                {formatCurrencyCLP(datos.efectivo_esperado)}
                            </h1>
                        </div>

                        {/* CAMPO PARA INGRESAR DINERO REAL */}
                        <div className="card border-warning shadow-sm mb-3">
                            <div className="card-header bg-warning text-dark fw-bold">
                                <i className="bi bi-cash-stack me-2"></i>Conteo Físico de Efectivo
                            </div>
                            <div className="card-body">
                                <Form.Group>
                                    <Form.Label>¿Cuánto dinero hay realmente en el cajón?</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Ingresa el monto contado"
                                        value={efectivoReal}
                                        onChange={(e) => setEfectivoReal(e.target.value)}
                                        className="form-control-lg"
                                        min="0"
                                        step="1"
                                    />
                                </Form.Group>

                                {efectivoReal !== '' && (
                                    <div className={`alert alert-${getDiferenciaColor()} mt-3 mb-0`}>
                                        <h5 className="mb-0">
                                            <i className="bi bi-calculator-fill me-2"></i>
                                            {getDiferenciaTexto()}
                                        </h5>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* OBSERVACIONES */}
                        {Math.abs(diferencia) > 0 && (
                            <div className="card border-secondary shadow-sm mb-3">
                                <div className="card-header bg-secondary text-white fw-bold">
                                    <i className="bi bi-pencil-square me-2"></i>Observaciones
                                    {Math.abs(diferencia) > 1000 && <span className="text-warning ms-2">(Requerido)</span>}
                                </div>
                                <div className="card-body">
                                    <Form.Group>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Explica la diferencia encontrada..."
                                            value={observaciones}
                                            onChange={(e) => setObservaciones(e.target.value)}
                                        />
                                    </Form.Group>
                                </div>
                            </div>
                        )}

                        <div className="row g-3 mt-2">
                            {/* COLUMNA INGRESOS */}
                            <div className="col-md-6">
                                <div className="card h-100 border-success shadow-sm">
                                    <div className="card-header bg-success text-white fw-bold">
                                        <i className="bi bi-arrow-up-circle me-2"></i>Ingresos (Ventas)
                                    </div>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Efectivo:</span>
                                            <span className="fw-bold text-success">{formatCurrencyCLP(datos.efectivo_ventas)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Tarjeta:</span>
                                            <span className="fw-bold text-primary">{formatCurrencyCLP(datos.tarjeta)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span>Transferencia:</span>
                                            <span className="fw-bold text-info">{formatCurrencyCLP(datos.transferencia)}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between bg-light fw-bold">
                                            <span>TOTAL VENDIDO:</span>
                                            <span>{formatCurrencyCLP(datos.total_ventas)}</span>
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
                                        <h3 className="text-danger fw-bold">{formatCurrencyCLP(datos.total_gastos)}</h3>
                                        <p className="text-muted small mb-0">Retiros registrados hoy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={guardando}>
                    Cancelar
                </Button>
                <Button 
                    variant="success" 
                    onClick={handleRegistrarCierre} 
                    disabled={loading || !datos || guardando || efectivoReal === ''}
                >
                    {guardando ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check-circle me-2"></i>
                            Registrar Cierre
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CierreCajaModal;
