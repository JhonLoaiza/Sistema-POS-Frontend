import React, { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { formatCurrencyCLP } from '../utils/formatters.js';

function TicketModal({ show, handleClose, items, total, onNuevaVenta }) {
    const [telefono, setTelefono] = useState('');

    // Función que construye el mensaje y abre WhatsApp
    const enviarWhatsApp = () => {
        // 1. Encabezado del mensaje
        let mensaje = `🧾 *COMPROBANTE DE VENTA*\n`;
        mensaje += `*Almacén Lorena*\n`;
        mensaje += `Fecha: ${new Date().toLocaleDateString()}\n`;
        mensaje += `--------------------------------\n`;

        // 2. Detalle de productos
        items.forEach(item => {
            // Ejemplo: 2 x Coca Cola ($3.000)
            const subtotal = item.precio_venta * item.cantidad_venta;
            mensaje += `${item.cantidad_venta} x ${item.nombre} (${formatCurrencyCLP(subtotal)})\n`;
        });

        // 3. Total y Pie de página
        mensaje += `--------------------------------\n`;
        mensaje += `*TOTAL: ${formatCurrencyCLP(total)}*\n\n`;
        mensaje += `¡Gracias por su compra! 🛒`;

        // 4. Codificar para URL (cambiar espacios por %20, etc)
        const mensajeCodificado = encodeURIComponent(mensaje);

        // 5. Construir enlace (Si hay teléfono usa wa.me/numero, si no, usa api genérica)
        let url = '';
        if (telefono) {
            // Limpiamos el teléfono (quitamos espacios o +56) y agregamos código país 569
            let numeroLimpio = telefono.replace(/\D/g, ''); // Solo números
            if (numeroLimpio.length === 8) numeroLimpio = '569' + numeroLimpio; // Si escriben 912345678
            if (numeroLimpio.length === 9 && numeroLimpio.startsWith('9')) numeroLimpio = '56' + numeroLimpio;

            url = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
        } else {
            // Si no pone número, intenta abrir la app para elegir contacto (funciona mejor en móvil)
            url = `https://api.whatsapp.com/send?text=${mensajeCodificado}`;
        }

        // 6. Abrir en nueva pestaña
        window.open(url, '_blank');
        
        // Opcional: Cerrar modal y limpiar venta después de enviar
        // onNuevaVenta(); 
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header className="bg-success text-white">
                <Modal.Title><i className="bi bi-check-circle-fill me-2"></i>¡Venta Exitosa!</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-4">
                <h1 className="text-success fw-bold mb-3">{formatCurrencyCLP(total)}</h1>
                <p className="text-muted mb-4">La venta se registró correctamente.</p>

                <div className="card bg-light border-0 p-3 mb-4">
                    <label className="form-label fw-bold text-success mb-2">
                        <i className="bi bi-whatsapp me-2"></i>Enviar Comprobante por WhatsApp
                    </label>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">+56 9</InputGroup.Text>
                        <Form.Control
                            placeholder="Ej: 8765 4321"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            type="tel"
                        />
                    </InputGroup>
                    <Button variant="success" className="w-100 fw-bold" onClick={enviarWhatsApp}>
                        <i className="bi bi-send me-2"></i>Enviar Ticket
                    </Button>
                </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-center border-0 pb-4">
                <Button variant="outline-secondary" size="lg" className="px-5" onClick={onNuevaVenta}>
                    Cerrar y Nueva Venta
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default TicketModal;