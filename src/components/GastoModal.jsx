import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Asegúrate de tener react-bootstrap instalado
import { toast } from 'react-toastify';
import gastoService from '../services/gasto.service';

const GastoModal = ({ show, handleClose }) => {
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!monto || !descripcion) return toast.warning("Completa los campos");

        setLoading(true);
        try {
            await gastoService.registrarGasto({ monto, descripcion });
            toast.success("Gasto registrado correctamente");
            setMonto('');
            setDescripcion('');
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar");
        }
        setLoading(false);
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton className="bg-danger text-white">
                <Modal.Title>Registrar Salida de Dinero</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Monto a Retirar ($)</Form.Label>
                        <Form.Control 
                            type="number" 
                            autoFocus
                            value={monto} 
                            onChange={(e) => setMonto(e.target.value)} 
                            placeholder="Ej: 2000"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Motivo</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={descripcion} 
                            onChange={(e) => setDescripcion(e.target.value)} 
                            placeholder="Ej: Compra de hielo"
                        />
                    </Form.Group>
                    <Button variant="danger" type="submit" className="w-100" disabled={loading}>
                        {loading ? 'Guardando...' : 'Confirmar Retiro'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default GastoModal;