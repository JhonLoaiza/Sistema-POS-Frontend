import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters';

const HistorialPage = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ventas');
            setVentas(res.data);
            setLoading(false);
        } catch (error) {
            toast.error("Error cargando historial");
            setLoading(false);
        }
    };

    const handleAnular = async (id) => {
        if (!window.confirm("¿Seguro que quieres anular esta venta? El stock se devolverá al inventario.")) return;

        try {
            await axios.delete(`http://localhost:5000/api/ventas/${id}`);
            toast.success("Venta anulada y stock recuperado");
            cargarVentas(); // Recargar la lista
        } catch (error) {
            toast.error("Error al anular");
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4"><i className="bi bi-clock-history me-2"></i>Historial de Ventas Recientes</h2>
            
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Hora</th>
                                    <th>Productos</th>
                                    <th>Método</th>
                                    <th className="text-end">Total</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5">Cargando...</td></tr>
                                ) : ventas.map(venta => (
                                    <tr key={venta.id}>
                                        <td className="ps-4 text-muted">#{venta.id}</td>
                                        <td>
                                            {new Date(venta.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            <small className="d-block text-muted">
                                                {new Date(venta.fecha).toLocaleDateString()}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="badge bg-secondary">{venta.cantidad_items} ítems</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                venta.metodo_pago === 'efectivo' ? 'bg-success' : 
                                                venta.metodo_pago === 'tarjeta' ? 'bg-primary' : 'bg-info'
                                            }`}>
                                                {venta.metodo_pago}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold fs-5">
                                            {formatCurrencyCLP(venta.total)}
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleAnular(venta.id)}
                                                title="Anular venta y devolver stock"
                                            >
                                                <i className="bi bi-trash"></i> Anular
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {ventas.length === 0 && !loading && (
                            <div className="text-center py-5 text-muted">No hay ventas registradas hoy.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorialPage;