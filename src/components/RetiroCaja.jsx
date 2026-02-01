import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import gastoService from '../services/gasto.service'; 
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters';

const RetiroCajaModal = ({ show, handleClose, onRetiroExitoso }) => {
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estado para guardar los datos del voucher
    const [voucherData, setVoucherData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!monto || !descripcion) {
            toast.warning("Completa todos los campos");
            return;
        }

        setLoading(true);
        try {
            // 1. Enviamos los datos al backend para guardar
            const res = await gastoService.registrarRetiro({
                monto: parseInt(monto),
                descripcion
            });

            // 2. CONSTRUIMOS EL VOUCHER MANUALMENTE
            // En lugar de confiar en que res.data traiga todo, usamos lo que ya tenemos.
            const datosParaImprimir = {
                // El backend SÍ o SÍ nos debe devolver el ID (puede venir como id o insertId)
                id: res.data.id || res.data.insertId || 'Pendiente',
                
                // Usamos los datos del formulario local
                monto: parseInt(monto),
                descripcion: descripcion,
                
                // Generamos la fecha actual aquí mismo
                fecha: new Date().toISOString() 
            };

            setVoucherData(datosParaImprimir);
            toast.success("Retiro registrado");

            // 3. Imprimimos
            setTimeout(() => {
                window.print();
                // Opcional: Cerrar modal después de imprimir
                // handleCloseTotal(); 
            }, 500);

        } catch (error) {
            console.error(error);
            toast.error("Error al registrar el retiro");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseTotal = () => {
        setMonto('');
        setDescripcion('');
        setVoucherData(null);
        handleClose();
        if (onRetiroExitoso) onRetiroExitoso();
    };

    return (
        <>
            {/* --- FORMULARIO VISIBLE (NO SE IMPRIME) --- */}
            {/* El CSS se encargará de ocultar este Modal al imprimir */}
            <Modal show={show} onHide={handleCloseTotal} centered backdrop="static">
                <Modal.Header closeButton className="bg-warning">
                    <Modal.Title className="text-dark">
                        <i className="bi bi-cash-coin me-2"></i>Retirar Dinero
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Monto a Retirar</Form.Label>
                            <Form.Control 
                                type="number" 
                                placeholder="Ej: 20000"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Motivo / Descripción</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={2}
                                placeholder="Ej: Pago Proveedor, Retiro de Ganancias..."
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </Form.Group>
                        <div className="d-grid">
                            <Button variant="dark" type="submit" disabled={loading}>
                                {loading ? 'Registrando...' : 'Confirmar e Imprimir'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* --- TICKET OCULTO EN PANTALLA NORMAL --- */}
            {/* d-none lo oculta de la vista normal. El CSS de impresión lo hará visible. */}
            <div id="section-to-print" className="d-none">
                {voucherData && (
                    <div className="ticket-content" style={{ width: '100%' }}>
                        <h4 style={{ margin: '0', fontWeight: 'bold', textAlign: 'center' }}>COMPROBANTE RETIRO</h4>
                        <p style={{ margin: '5px 0', textAlign: 'center' }}>********************************</p>
                        
                        <div style={{ textAlign: 'left', margin: '10px 0' }}>
                            <p style={{ margin: '2px 0' }}><strong>Fecha:</strong> {new Date(voucherData.fecha).toLocaleString()}</p>
                            <p style={{ margin: '2px 0' }}><strong>N° Mov:</strong> #{voucherData.id}</p>
                        </div>
                        
                        <p style={{ margin: '5px 0', textAlign: 'center' }}>--------------------------------</p>
                        
                        <h2 style={{ margin: '15px 0', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                            {formatCurrencyCLP(voucherData.monto)}
                        </h2>
                        
                        <p style={{ margin: '5px 0', textAlign: 'center' }}>--------------------------------</p>
                        
                        <div style={{ textAlign: 'left', marginTop: '10px', marginBottom: '40px' }}>
                            <strong>DESCRIPCIÓN:</strong><br/>
                            {/* Protección contra undefined */}
                            <span style={{ display: 'block', marginTop: '5px' }}>
                                {(voucherData.descripcion || '').toUpperCase()}
                            </span>
                        </div>

                        <br />
                        <div style={{ textAlign: 'center' }}>
                            <p>__________________________</p>
                            <p style={{ fontSize: '10px' }}>FIRMA CAJERO / RESPONSABLE</p>
                            <br />
                            <p>.</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default RetiroCajaModal;