import React, { useState, useEffect } from 'react';
import ventaService from '../services/venta.service'; // Importamos el servicio
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
            setLoading(true);
            // Usamos el servicio en lugar de axios directo
            const res = await ventaService.getVentas();
            setVentas(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando historial");
            setLoading(false);
        }
    };

    const handleAnular = async (id) => {
        if (!window.confirm("¿Seguro que quieres anular esta venta? El stock se devolverá al inventario.")) return;

        try {
            // Usamos el servicio para anular
            await ventaService.anularVenta(id);
            toast.success("Venta anulada y stock recuperado");
            cargarVentas(); // Recargar la lista
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error al anular venta");
        }
    };

    return (
        <div className="container mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary"><i className="bi bi-clock-history me-2"></i>Historial de Ventas</h2>
                <button className="btn btn-outline-primary btn-sm" onClick={cargarVentas}>
                    <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
                </button>
            </div>
            
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Fecha / Hora</th>
                                    <th>Detalle</th>
                                    <th>Método</th>
                                    <th className="text-end">Total</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                                ) : ventas.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5 text-muted">No hay ventas registradas.</td></tr>
                                ) : ventas.map(venta => (
                                    <tr key={venta.id}>
                                        <td className="ps-4 text-muted fw-bold">#{venta.id}</td>
                                        <td>
                                            <div className="fw-bold">{new Date(venta.fecha).toLocaleDateString()}</div>
                                            <small className="text-muted">
                                                {new Date(venta.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </small>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {venta.cantidad_items || 0} productos
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                venta.metodo_pago === 'efectivo' ? 'bg-success' : 
                                                venta.metodo_pago === 'tarjeta' ? 'bg-primary' : 'bg-info text-dark'
                                            }`}>
                                                {venta.metodo_pago ? venta.metodo_pago.toUpperCase() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold fs-5 text-dark">
                                            {formatCurrencyCLP(venta.total)}
                                        </td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleAnular(venta.id)}
                                                title="Anular venta y devolver stock"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorialPage;