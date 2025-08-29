import { useState, useEffect } from 'react';
import axios from 'axios';
import './solicitudAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import { BackToMenu } from '../../../components/BackToMenu';

interface Solicitud {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  dj?: {
    id: number;
    nombreArtistico: string;
  };
  salon?: {
    id: number;
    nombre: string;
  };
  barra?: {
    id: number;
    nombreB: string;
  };
  gastronomico?: {
    id: number;
    nombreG: string;
  };
  estado: string;
  fechaSolicitud: string;
  montoDj?: number;
  montoSalon?: number;
  montoBarra?: number;
  montoGastro?: number;
  montoTotal: number;
}

export function SolicitudAdmin() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:3000/api/solicitud',
          {
            withCredentials: true,
          }
        );
        setSolicitudes(response.data.data);
        setError(null);
      } catch (error: any) {
        console.error('Error al cargar solicitudes:', error);
        setError(
          error.response?.data?.message || 'Error al cargar las solicitudes'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoBadge = (estado: string) => {
    const className = `estado-badge estado-${estado
      .replace(/\s+/g, '-')
      .toLowerCase()}`;
    return <span className={className}>{estado}</span>;
  };

  if (loading) {
    return (
      <div className="solicitud-admin-container">
        <BackToMenu className="admin-style" />
        <UserBadge />
        <div className="solicitud-admin-content">
          <h2>Solicitudes</h2>
          <div className="loading">Cargando solicitudes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solicitud-admin-container">
        <BackToMenu className="admin-style" />
        <UserBadge />
        <div className="solicitud-admin-content">
          <h2>Solicitudes</h2>
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitud-admin-container">
      <BackToMenu className="admin-style" />
      <UserBadge />

      <div className="solicitud-admin-content">
        <h2>Gestión de Solicitudes</h2>

        {solicitudes.length === 0 ? (
          <div className="no-solicitudes">
            <p>No hay solicitudes registradas</p>
          </div>
        ) : (
          <div className="solicitudes-table-container">
            <div className="solicitudes-stats">
              <p>
                Total de solicitudes: <strong>{solicitudes.length}</strong>
              </p>
            </div>

            <div className="table-wrapper">
              <table className="solicitudes-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Servicios</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id}>
                      <td>#{solicitud.id}</td>
                      <td>
                        <div className="cliente-info">
                          <strong>
                            {solicitud.usuario.nombre}{' '}
                            {solicitud.usuario.apellido}
                          </strong>
                          <small>{solicitud.usuario.email}</small>
                        </div>
                      </td>
                      <td>
                        <div className="servicios-lista">
                          {solicitud.dj && (
                            <div className="servicio-item">
                              <span className="servicio-tipo">DJ:</span>{' '}
                              {solicitud.dj.nombreArtistico}
                              {solicitud.montoDj && (
                                <span className="monto">
                                  (${solicitud.montoDj.toLocaleString('es-AR')})
                                </span>
                              )}
                            </div>
                          )}
                          {solicitud.salon && (
                            <div className="servicio-item">
                              <span className="servicio-tipo">Salón:</span>{' '}
                              {solicitud.salon.nombre}
                              {solicitud.montoSalon && (
                                <span className="monto">
                                  ($
                                  {solicitud.montoSalon.toLocaleString('es-AR')}
                                  )
                                </span>
                              )}
                            </div>
                          )}
                          {solicitud.barra && (
                            <div className="servicio-item">
                              <span className="servicio-tipo">Barra:</span>{' '}
                              {solicitud.barra.nombreB}
                              {solicitud.montoBarra && (
                                <span className="monto">
                                  ($
                                  {solicitud.montoBarra.toLocaleString('es-AR')}
                                  )
                                </span>
                              )}
                            </div>
                          )}
                          {solicitud.gastronomico && (
                            <div className="servicio-item">
                              <span className="servicio-tipo">
                                Gastronómico:
                              </span>{' '}
                              {solicitud.gastronomico.nombreG}
                              {solicitud.montoGastro && (
                                <span className="monto">
                                  ($
                                  {solicitud.montoGastro.toLocaleString(
                                    'es-AR'
                                  )}
                                  )
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{getEstadoBadge(solicitud.estado)}</td>
                      <td>{formatFecha(solicitud.fechaSolicitud)}</td>
                      <td className="total-amount">
                        <strong>
                          ${solicitud.montoTotal.toLocaleString('es-AR')}
                        </strong>
                      </td>
                      <td>
                        <div className="acciones">
                          <button
                            className="btn-ver"
                            onClick={() => {
                              /* TODO: Implementar vista detallada */
                            }}
                          >
                            Ver
                          </button>
                          <button
                            className="btn-editar"
                            onClick={() => {
                              /* TODO: Implementar edición de estado */
                            }}
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SolicitudAdmin;
