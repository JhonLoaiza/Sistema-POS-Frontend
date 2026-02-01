import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Image, Row, Col, InputGroup } from 'react-bootstrap';

function ProductoModal({ show, handleClose, producto, onSave }) {
    // Agregamos margen_ganancia al estado inicial
    const [formData, setFormData] = useState({
        nombre: '', 
        codigo_barras: '', 
        precio_costo: '', 
        precio_venta: '', 
        stock: '', 
        stock_minimo: 5, 
        imagen: '',
        margen_ganancia: 30 // Valor por defecto
    });
    const [imagenFile, setImagenFile] = useState(null);

    const modalTitle = producto ? 'Editar Producto' : 'Crear Nuevo Producto';
    
    // --- LÓGICA DE CÁLCULO (IVA 19%) ---
    const calcularPrecioVenta = (costo, margen) => {
        if (!costo) return '';
        const c = parseFloat(costo);
        const m = parseFloat(margen || 0);
        // Costo * (1 + %Margen) * 1.19 (IVA)
        const precioNeto = c * (1 + (m / 100));
        const precioFinal = precioNeto * 1.19;
        return Math.round(precioFinal);
    };

    const calcularMargen = (costo, precioVenta) => {
        if (!costo || !precioVenta) return 0;
        const c = parseFloat(costo);
        const p = parseFloat(precioVenta);
        // Sacamos el IVA al precio venta
        const precioNeto = p / 1.19;
        // Calculamos margen: ((PrecioNeto - Costo) / Costo) * 100
        const m = ((precioNeto - c) / c) * 100;
        return m.toFixed(1);
    };

    useEffect(() => {
        if (producto) {
            // Si estamos editando, calculamos el margen actual basado en los precios guardados
            const margenCalculado = calcularMargen(producto.precio_costo, producto.precio_venta);
            
            setFormData({
                ...producto,
                margen_ganancia: margenCalculado
            });
            setImagenFile(null);
        } else {
            // Si es nuevo, reseteamos todo
            setFormData({
                nombre: '', 
                codigo_barras: '', 
                precio_costo: '', 
                precio_venta: '', 
                stock: '', 
                stock_minimo: 5, 
                imagen: '',
                margen_ganancia: 30
            });
            setImagenFile(null);
        }
    }, [producto, show]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Copiamos el estado actual
        let nuevoEstado = { ...formData, [name]: value };

        // 1. Si cambia el COSTO -> Recalcular Precio Venta
        if (name === 'precio_costo') {
            const nuevoPrecio = calcularPrecioVenta(value, formData.margen_ganancia);
            nuevoEstado.precio_venta = nuevoPrecio;
        }

        // 2. Si cambia el MARGEN -> Recalcular Precio Venta
        if (name === 'margen_ganancia') {
            const nuevoPrecio = calcularPrecioVenta(formData.precio_costo, value);
            nuevoEstado.precio_venta = nuevoPrecio;
        }

        // 3. Si cambia el PRECIO VENTA (Manual) -> Recalcular Margen
        if (name === 'precio_venta') {
            const nuevoMargen = calcularMargen(formData.precio_costo, value);
            nuevoEstado.margen_ganancia = nuevoMargen;
        }

        setFormData(nuevoEstado);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setImagenFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        
        // Convertimos valores numéricos antes de enviar
        const dataFinal = {
            ...formData,
            precio_costo: parseInt(formData.precio_costo) || 0,
            precio_venta: parseInt(formData.precio_venta) || 0,
            stock: parseInt(formData.stock) || 0,
            stock_minimo: parseInt(formData.stock_minimo) || 0,
        };

        // Quitamos margen_ganancia del FormData si no lo guardas en BD, 
        // o lo dejamos si quieres guardarlo. Aquí lo agrego al loop:
        for (const key in dataFinal) {
            data.append(key, dataFinal[key]);
        }

        if (imagenFile) {
            data.append('imagen', imagenFile);
        }
        
        onSave(data); 
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    
                    {/* Fila 1: Nombre y Código */}
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Group>
                                <Form.Label>Nombre del Producto</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="nombre" 
                                    value={formData.nombre || ''} 
                                    onChange={handleChange} 
                                    required 
                                    autoFocus
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Código Barras</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><i className="bi bi-upc"></i></InputGroup.Text>
                                    <Form.Control 
                                        type="text" 
                                        name="codigo_barras" 
                                        value={formData.codigo_barras || ''} 
                                        onChange={handleChange} 
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* SECCIÓN CALCULADORA DE PRECIOS */}
                    <div className="p-3 mb-4 bg-light border rounded">
                        <h6 className="text-primary fw-bold mb-3">
                            <i className="bi bi-calculator me-2"></i>Cálculo de Precios
                        </h6>
                        <Row>
                            {/* Costo Neto */}
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted">Costo Neto (Sin IVA)</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>$</InputGroup.Text>
                                        <Form.Control 
                                            type="number" 
                                            name="precio_costo" 
                                            value={formData.precio_costo || ''} 
                                            onChange={handleChange} 
                                            placeholder="0"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            {/* Margen % */}
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted">Margen Ganancia</Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type="number" 
                                            name="margen_ganancia" 
                                            value={formData.margen_ganancia || ''} 
                                            onChange={handleChange} 
                                        />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            </Col>

                            {/* Precio Venta Final */}
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-success small">Precio Venta (Con IVA)</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-success text-white border-success">$</InputGroup.Text>
                                        <Form.Control 
                                            type="number" 
                                            name="precio_venta" 
                                            value={formData.precio_venta || ''} 
                                            onChange={handleChange} 
                                            className="fw-bold fs-5"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Stocks e Imagen */}
                    <Row>
                        <Col md={6}>
                             <div className="row">
                                <div className="col-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Stock Actual</Form.Label>
                                        <Form.Control type="number" name="stock" value={formData.stock || ''} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                                <div className="col-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Stock Mínimo</Form.Label>
                                        <Form.Control type="number" name="stock_minimo" value={formData.stock_minimo || 5} onChange={handleChange} />
                                    </Form.Group>
                                </div>
                            </div>
                        </Col>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Imagen del Producto</Form.Label>
                                <Form.Control type="file" name="imagen" accept="image/*" onChange={handleFileChange} />
                                <div className="mt-2 text-center">
                                    {imagenFile ? (
                                        <Image src={URL.createObjectURL(imagenFile)} thumbnail style={{ maxHeight: '100px' }} />
                                    ) : formData.imagen ? (
                                        <Image src={`http://localhost:5000/${formData.imagen}`} thumbnail style={{ maxHeight: '100px' }} />
                                    ) : null}
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                        <Button variant="primary" type="submit">
                            <i className="bi bi-save me-2"></i>Guardar Producto
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
export default ProductoModal;