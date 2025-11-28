import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Image } from 'react-bootstrap';

function ProductoModal({ show, handleClose, producto, onSave }) {
    const [formData, setFormData] = useState({});
    const [imagenFile, setImagenFile] = useState(null);

    const modalTitle = producto ? 'Editar Producto' : 'Crear Nuevo Producto';
    
    useEffect(() => {
        if (producto) {
            setFormData(producto);
            setImagenFile(null);
        } else {
            setFormData({
                nombre: '', codigo_barras: '', precio_costo: '', precio_venta: '', stock: '', stock_minimo: 5, imagen: ''
            });
            setImagenFile(null);
        }
    }, [producto, show]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setImagenFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(); // Clave para enviar archivos
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (imagenFile) {
            data.append('imagen', imagenFile);
        } else if (producto && producto.imagen) {
            // (Opcional: lógica para mantener imagen si no se cambia)
        }
        onSave(data); 
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton><Modal.Title>{modalTitle}</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {/* Nombre */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
                    </Form.Group>
                    {/* Precios */}
                    <div className="row">
                        <div className="col-6"><Form.Group className="mb-3"><Form.Label>Costo</Form.Label><Form.Control type="number" name="precio_costo" value={formData.precio_costo || ''} onChange={handleChange} /></Form.Group></div>
                        <div className="col-6"><Form.Group className="mb-3"><Form.Label>Venta</Form.Label><Form.Control type="number" name="precio_venta" value={formData.precio_venta || ''} onChange={handleChange} /></Form.Group></div>
                    </div>
                    {/* Stocks */}
                    <div className="row">
                        <div className="col-6"><Form.Group className="mb-3"><Form.Label>Stock</Form.Label><Form.Control type="number" name="stock" value={formData.stock || ''} onChange={handleChange} /></Form.Group></div>
                        <div className="col-6"><Form.Group className="mb-3"><Form.Label>Minimo</Form.Label><Form.Control type="number" name="stock_minimo" value={formData.stock_minimo || 5} onChange={handleChange} /></Form.Group></div>
                    </div>
                     {/* Código */}
                     <Form.Group className="mb-3"><Form.Label>Código Barras</Form.Label><Form.Control type="text" name="codigo_barras" value={formData.codigo_barras || ''} onChange={handleChange} /></Form.Group>
                    
                    {/* Imagen */}
                    <Form.Group className="mb-3">
                        <Form.Label>Imagen</Form.Label>
                        <Form.Control type="file" name="imagen" accept="image/*" onChange={handleFileChange} />
                        <div className="mt-2 text-center">
                            {imagenFile ? (
                                <Image src={URL.createObjectURL(imagenFile)} thumbnail style={{ maxHeight: '150px' }} />
                            ) : formData.imagen ? (
                                <Image src={`http://localhost:5000/${formData.imagen}`} thumbnail style={{ maxHeight: '150px' }} />
                            ) : null}
                        </div>
                    </Form.Group>

                    <div className="text-end">
                        <Button variant="secondary" onClick={handleClose} className="me-2">Cancelar</Button>
                        <Button variant="primary" type="submit">Guardar</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
export default ProductoModal;