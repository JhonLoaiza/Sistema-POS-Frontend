import { useState, useEffect } from 'react';
import mermaService from '../services/merma.service';
import { toast } from 'react-toastify';
import { formatCurrencyCLP } from '../utils/formatters';

const PageWrapper = ({ title, children }) => (
    <div className="card shadow-sm h-100">
        <div className="card-header bg-white py-3">
            <h4 className="mb-0 text-primary">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {title}
            </h4>
        </div>
        <div className="card-body">
            {children}
        </div>
    </div>
);

function HistorialMermasPage() {
    const [mermas, setMermas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: '',
        motivo: ''
    });

    useEffect(() => {
        cargarMermas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarMermas = async () => {
        try {
            setLoading(true);
            let response;
            
            // Si hay filtros de fecha, usar obtenerPorRango
            if (filtros.fechaInicio && filtros.fechaFin) {
                response = await mermaService.obtenerPorRango(filtros.fechaInicio, filtros.fechaFin);
            } else {
                // Si no hay filtros de fecha, obtener todas
                response = await mermaService.obtenerTodas();
            }
            
            // Aplicar filtro de motivo en el cliente si está presente
            let mermasData = response.data;
            if (filtros.motivo) {
                mermasData = mermasData.filter(m => m.motivo === filtros.motivo);
            }
            
            setMermas(mermasData);
        } catch (error) {
            console.error('Error al cargar mermas:', error);
            toast.error('Error al cargar el historial de mermas');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const aplicarFiltros = () => {
        cargarMermas();
    };

    const limpiarFiltros = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            motivo: ''
        });
        setTimeout(() => cargarMermas(), 100);
    };

    const getMotivoLabel = (motivo) => {
        const labels = {
            vencido: 'Vencido',
            dañado: 'Dañado',
            perdido: 'Perdido',
            robo: 'Robo',
            otro: 'Otro'
        };
        return labels[motivo] || motivo;
    };

    const getMotivoBadge = (motivo) => {
        const badges = {
            vencido: 'bg-warning',
            dañado: 'bg-danger',
            perdido: 'bg-secondary',
            robo: 'bg-dark',
            otro: 'bg-info'
        };
        return badges[motivo] || 'bg-secondary';
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calcular totales
    const totalMermas = mermas.length;
    const totalCosto = mermas.reduce((sum, m) => sum + parseFloat(m.costo_total || 0), 0);
    const totalUnidades = mermas.reduce((sum, m) => sum + parseInt(m.cantidad || 0), 0);

    return (
        <PageWrapper title="Historial de Mermas y Pérdidas">
            {/* Filtros */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Fecha Inicio</label>
                            <input
                                type="date"
                                className="form-control"
                                name="fechaInicio"
                                value={filtros.fechaInicio}
                                onChange={handleFiltroChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Fecha Fin</label>
                            <input
                                type="date"
                                className="form-control"
                                name="fechaFin"
                                value={filtros.fechaFin}
                                onChange={handleFiltroChange}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Motivo</label>
                            <select
                                className="form-select"
                                name="motivo"
                                value={filtros.motivo}
                                onChange={handleFiltroChange}
                            >
                                <option value="">Todos</option>
                                <option value="vencido">Vencido</option>
                                <option value="dañado">Dañado</option>
                                <option value="perdido">Perdido</option>
                                <option value="robo">Robo</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button 
                                className="btn btn-primary me-2"
                                onClick={aplicarFiltros}
                            >
                                <i className="bi bi-search me-2"></i>
                                Filtrar
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={limpiarFiltros}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen */}
            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="card bg-danger text-white">
                        <div className="card-body">
                            <h6>Total Mermas</h6>
                            <h3>{totalMermas}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-warning text-dark">
                        <div className="card-body">
                            <h6>Total Unidades</h6>
                            <h3>{totalUnidades}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h6>Costo Total</h6>
                            <h3>{formatCurrencyCLP(totalCosto)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Motivo</th>
                                <th>Costo</th>
                                <th>Usuario</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mermas.map((merma) => (
                                <tr key={merma.id}>
                                    <td>{merma.id}</td>
                                    <td>{formatFecha(merma.fecha)}</td>
                                    <td className="fw-bold">{merma.producto_nombre}</td>
                                    <td>
                                        <span className="badge bg-danger">
                                            {merma.cantidad}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getMotivoBadge(merma.motivo)}`}>
                                            {getMotivoLabel(merma.motivo)}
                                        </span>
                                    </td>
                                    <td>{formatCurrencyCLP(merma.costo_total)}</td>
                                    <td>{merma.usuario_nombre || '-'}</td>
                                    <td>
                                        {merma.descripcion ? (
                                            <small className="text-muted">{merma.descripcion}</small>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {mermas.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        No se encontraron mermas registradas
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </PageWrapper>
    );
}

export default HistorialMermasPage;
