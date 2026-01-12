import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';
import { formatCurrencyCLP } from '../utils/formatters.js';

function DetalleCompraModal({ show, handleClose, compra, detalles }) {
    if (!compra) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalle Factura N° {compra.nro_factura}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <strong>Proveedor:</strong> {compra.proveedor} <br/>
                    <strong>Fecha:</strong> {new Date(compra.fecha).toLocaleDateString()} <br/>
                    <strong>Registrado por:</strong> {compra.usuario_nombre}
                </div>

                <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                        <thead className="table-dark">
                            <tr>
                                <th>Producto</th>
                                <th>Bultos</th>
                                <th>Unid/Bulto</th>
                                <th>Costo Neto</th>
                                <th>% Ganancia</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalles.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.producto_nombre}</td>
                                    <td>{item.cantidad_bultos}</td>
                                    <td>{item.unidades_por_bulto}</td>
                                    <td>{formatCurrencyCLP(item.costo_neto_total)}</td>
                                    <td>{item.porcentaje_ganancia}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                
                <h4 className="text-end mt-3">
                    Total Factura: {formatCurrencyCLP(compra.total_compra)}
                </h4>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DetalleCompraModal;