import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

/**
 * Modal para registrar mermas/pérdidas de productos
 * @param {boolean} show - Controla la visibilidad del modal
 * @param {function} handleClose - Función para cerrar el modal
 * @param {object} producto - Producto seleccionado para registrar merma
 * @param {function} onSave - Callback después de guardar exitosamente
 */
function MermaModal({ show, handleClose, producto, onSave }) {
    const [formData, setFormData] = useState({
        cantidad: '',
        motivo: 'vencido',
        descripcion: ''
    });
    const [loading, setLoading] = useState(false);

    // Reset form cuando cambia el producto
    useEffect(() => {
        if (producto) {
            setFormData({
                cantidad: '',
                motivo: 'vencido',
                descripcion: ''
            });
        }
    }, [producto]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!formData.cantidad || formData.cantidad <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }

        if (parseInt(formData.cantidad) > producto.stock) {
            toast.error(`La cantidad no puede ser mayor al stock disponible (${producto.stock})`);
            return;
        }

        if (!formData.motivo) {
            toast.error('Debes seleccionar un motivo');
            return;
        }

        setLoading(true);
        try {
            await onSave({
                producto_id: producto.id,
                cantidad: parseInt(formData.cantidad),
                motivo: formData.motivo,
                descripcion: formData.descripcion || null
            });
            
            handleClose();
        } catch (error) {
            console.error('Error al registrar merma:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!producto) return null;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-danger text-white">
                <Modal.Title>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Registrar Merma/Pérdida
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {/* Información del producto */}
                    <div className="alert alert-info mb-3">
                        <strong>Producto:</strong> {producto.nombre}<br />
                        <strong>Stock actual:</strong> {producto.stock} unidades
                    </div>

                    {/* Cantidad */}
                    <Form.Group className="mb-3">
                        <Form.Label>Cantidad perdida *</Form.Label>
                        <Form.Control
                            type="number"
                            name="cantidad"
                            value={formData.cantidad}
                            onChange={handleChange}
                            min="1"
                            max={producto.stock}
                            required
                            autoFocus
                        />
                        <Form.Text className="text-muted">
                            Máximo: {producto.stock} unidades
                        </Form.Text>
                    </Form.Group>

                    {/* Motivo */}
                    <Form.Group className="mb-3">
                        <Form.Label>Motivo *</Form.Label>
                        <Form.Select
                            name="motivo"
                            value={formData.motivo}
                            onChange={handleChange}
                            required
                        >
                            <option value="vencido">Vencido</option>
                            <option value="dañado">Dañado</option>
                            <option value="perdido">Perdido</option>
                            <option value="robo">Robo</option>
                            <option value="otro">Otro</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Descripción */}
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción (opcional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Detalles adicionales sobre la merma..."
                        />
                    </Form.Group>

                    {/* Advertencia */}
                    <div className="alert alert-warning mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Esta acción descontará el stock automáticamente y no se puede deshacer.
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Registrando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                Registrar Merma
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default MermaModal;
