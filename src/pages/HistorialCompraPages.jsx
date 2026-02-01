import React, { useState, useEffect } from 'react';
import compraService from '../services/compra.service';
import DetalleCompraModal from '../components/DetalleCompraModal.jsx';
import { formatCurrencyCLP } from '../utils/formatters.js';
import { toast } from 'react-toastify';

const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm h-100">
        <div className="card-header bg-white py-3">
            <h4 className="mb-0 text-primary"><i className="bi bi-clock-history me-2"></i>{title}</h4>
        </div>
        <div className="card-body">
            {children}
        </div>
    </div>
);

function HistorialComprasPage() {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- MANEJO DE FECHAS (Rango Inicial: Últimos 30 días) ---
    const hoy = new Date().toISOString().split('T')[0];
    const haceUnMes = new Date();
    haceUnMes.setDate(haceUnMes.getDate() - 30);
    const fechaInicioDefault = haceUnMes.toISOString().split('T')[0];

    const [fechaDesde, setFechaDesde] = useState(fechaInicioDefault);
    const [fechaHasta, setFechaHasta] = useState(hoy);
    // ---------------------------------------------------------

    const [showModal, setShowModal] = useState(false);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);
    const [detallesCompra, setDetallesCompra] = useState([]);

    // Cargar compras cuando cambien las fechas
    useEffect(() => {
        cargarCompras();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fechaDesde, fechaHasta]); // <-- Se dispara al cambiar fechas

    const cargarCompras = async () => {
        try {
            setLoading(true);
            // Pasamos el rango al servicio
            const response = await compraService.getCompras(fechaDesde, fechaHasta);
            setCompras(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar el historial");
            setLoading(false);
        }
    };

    const verDetalle = async (compra) => {
        try {
            const response = await compraService.getDetalleCompra(compra.id);
            setCompraSeleccionada(compra);
            setDetallesCompra(response.data);
            setShowModal(true);
        } catch (error) {
            toast.error("Error al cargar los detalles");
        }
    };

    return (
        <PageWrapper title="Historial de Compras">
            
            {/* --- FILTROS DE FECHA --- */}
            <div className="row mb-4 align-items-end p-3 bg-light rounded border-start border-4 border-primary">
                <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Desde:</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        value={fechaDesde} 
                        onChange={(e) => setFechaDesde(e.target.value)} 
                    />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Hasta:</label>
                    <input 
                        type="date" 
                        className="form-control" 
                        value={fechaHasta} 
                        onChange={(e) => setFechaHasta(e.target.value)} 
                    />
                </div>
                <div className="col-md-3">
                    <small className="text-muted fst-italic">
                        Mostrando registros del periodo seleccionado.
                    </small>
                </div>
            </div>
            {/* ------------------------- */}

            {loading ? (
                <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>N° Factura</th>
                                <th>Proveedor</th>
                                <th>Repartidor</th>
                                <th>Registrado Por</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {compras.map(compra => (
                                <tr key={compra.id}>
                                    <td>{new Date(compra.fecha).toLocaleDateString('es-CL')}</td>
                                    <td className="fw-bold">{compra.nro_factura}</td>
                                    <td>{compra.proveedor}</td>
                                    <td>
                                        {compra.nombre_repartidor ? (
                                            <span className="badge bg-light text-dark border">
                                                <i className="bi bi-truck me-1"></i>
                                                {compra.nombre_repartidor}
                                            </span>
                                        ) : (
                                            <span className="text-muted small">-</span>
                                        )}
                                    </td>
                                    <td><span className="badge bg-secondary">{compra.usuario_nombre}</span></td>
                                    <td className="fw-bold text-success">{formatCurrencyCLP(compra.total_compra)}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info text-white" onClick={() => verDetalle(compra)}>
                                            <i className="bi bi-eye me-1"></i> Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {compras.length === 0 && (
                                <tr><td colSpan="7" className="text-center p-4 text-muted">No se encontraron compras en este rango de fechas.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <DetalleCompraModal 
                show={showModal} 
                handleClose={() => setShowModal(false)}
                compra={compraSeleccionada}
                detalles={detallesCompra}
            />
        </PageWrapper>
    );
}

export default HistorialComprasPage;