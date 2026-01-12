import React, { useState, useEffect } from 'react';
import productoService from '../services/producto.service';
import compraService from '../services/compra.service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { NumericFormat } from 'react-number-format'; // <--- IMPORTANTE

// Componente envoltorio
const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
            <h4 className="mb-0 text-primary"><i className="bi bi-file-earmark-text me-2"></i>{title}</h4>
        </div>
        <div className="card-body">{children}</div>
    </div>
);

function IngresoCompraPage() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estado de la Cabecera
    const [cabecera, setCabecera] = useState({
        proveedor: '',
        nro_factura: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Estado de los Items (Filas)
    const [items, setItems] = useState([
        { producto_id: '', cantidad_bultos: 1, unidades_por_bulto: 1, costo_neto_total: 0, porcentaje_ganancia: 40 }
    ]);

    useEffect(() => {
        productoService.getProductos()
            .then(res => setProductos(res.data))
            .catch(err => toast.error("Error al cargar productos"));
    }, []);

    const handleCabeceraChange = (e) => {
        setCabecera({ ...cabecera, [e.target.name]: e.target.value });
    };

    // Manejador genérico para inputs normales (select, bultos, ganancia)
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...items];
        newItems[index][name] = value;
        setItems(newItems);
    };

    const agregarFila = () => {
        setItems([...items, { producto_id: '', cantidad_bultos: 1, unidades_por_bulto: 1, costo_neto_total: 0, porcentaje_ganancia: 40 }]);
    };

    const eliminarFila = (index) => {
        if (items.length === 1) return;
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!cabecera.proveedor || !cabecera.nro_factura) {
            toast.warning("Faltan datos en la cabecera");
            return;
        }
        if (items.some(i => !i.producto_id)) {
            toast.warning("Selecciona un producto en todas las filas");
            return;
        }

        const compraData = { ...cabecera, items };

        try {
            setLoading(true);
            await compraService.registrarCompra(compraData);
            toast.success("Factura ingresada y stock actualizado!");
            navigate('/inventario');
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar la compra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper title="Ingreso de Factura (Compras)">
            <form onSubmit={handleSubmit}>
                {/* Cabecera */}
                <div className="row mb-4 p-3 bg-light rounded border">
                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">Proveedor</label>
                        <input type="text" className="form-control" name="proveedor" value={cabecera.proveedor} onChange={handleCabeceraChange} required placeholder="Ej: Coca Cola Andina" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">N° Factura</label>
                        <input type="text" className="form-control" name="nro_factura" value={cabecera.nro_factura} onChange={handleCabeceraChange} required placeholder="Ej: F-123456" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">Fecha</label>
                        <input type="date" className="form-control" name="fecha" value={cabecera.fecha} onChange={handleCabeceraChange} required />
                    </div>
                </div>

                {/* Detalles */}
                <h5 className="mb-3">Detalle de Productos</h5>
                <div className="table-responsive mb-3">
                    <table className="table table-bordered align-middle">
                        <thead className="table-secondary text-center">
                            <tr>
                                <th style={{width: '30%'}}>Producto</th>
                                <th>Bultos</th>
                                <th>Unid/Bulto</th>
                                <th>Costo Neto Total</th>
                                <th>% Ganancia</th>
                                <th style={{width: '50px'}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <select className="form-select" name="producto_id" value={item.producto_id} onChange={(e) => handleItemChange(index, e)} required>
                                            <option value="">Seleccionar...</option>
                                            {productos.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td><input type="number" className="form-control" name="cantidad_bultos" value={item.cantidad_bultos} onChange={(e) => handleItemChange(index, e)} min="1" required /></td>
                                    <td><input type="number" className="form-control" name="unidades_por_bulto" value={item.unidades_por_bulto} onChange={(e) => handleItemChange(index, e)} min="1" required /></td>
                                    
                                    {/* --- INPUT DE MONEDA --- */}
                                    <td>
                                        <NumericFormat
                                            className="form-control fw-bold text-end"
                                            value={item.costo_neto_total}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$"
                                            decimalScale={0}
                                            allowNegative={false}
                                            onValueChange={(values) => {
                                                const { floatValue } = values;
                                                const newItems = [...items];
                                                newItems[index]['costo_neto_total'] = floatValue || 0;
                                                setItems(newItems);
                                            }}
                                            required
                                        />
                                    </td>
                                    {/* ----------------------- */}

                                    <td>
                                        <div className="input-group">
                                            <input type="number" className="form-control" name="porcentaje_ganancia" value={item.porcentaje_ganancia} onChange={(e) => handleItemChange(index, e)} min="0" required />
                                            <span className="input-group-text">%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminarFila(index)}><i className="bi bi-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button type="button" className="btn btn-outline-primary mb-4" onClick={agregarFila}>
                    <i className="bi bi-plus-circle me-2"></i> Agregar Otro Producto
                </button>

                <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                        {loading ? 'Guardando...' : 'Registrar Compra y Actualizar Stock'}
                    </button>
                </div>
            </form>
        </PageWrapper>
    );
}

export default IngresoCompraPage;