import { useState, useEffect } from 'react';
import axios from 'axios';
import './solicitudAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import { BackToMenu } from '../../../components/BackToMenu';
import { useAlert } from '../../../context/alertcontext';
import { useConfirm } from '../../../context/confirmcontext';

// Definir la estructura de una solicitud. crear un nuevo archivo con solo la interfaz
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
  fechaEvento: string;
  montoDj?: number;
  montoSalon?: number;
  montoBarra?: number;
  montoGastro?: number;
  montoTotal: number;
}

export function SolicitudAdmin() {
  const { showAlert } = useAlert();
  const { showConfirm } = useConfirm();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //Obtener todas las solicitudes
  //setear error

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

  // Formatear fecha

  const formatFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  //Obtener esttado y ajustar el estilo

  const getEstadoBadge = (estado: string) => {
    const className = `estado-badge estado-${estado
      .replace(/\s+/g, '-')
      .toLowerCase()}`;
    return <span className={className}>{estado}</span>;
  };

  //Eliminar Solicitud

  const handleEliminarSolicitud = async (
    solicitudId: number,
    clienteNombre: string
  ) => {
    const confirmacion = await showConfirm(
      `¿Estás seguro de que deseas eliminar la solicitud #${solicitudId} de ${clienteNombre}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmacion) {
      try {
        await axios.delete(
          `http://localhost:3000/api/solicitud/${solicitudId}`,
          { withCredentials: true }
        );

        // Actualizar la lista local eliminando la solicitud
        setSolicitudes(solicitudes.filter((s) => s.id !== solicitudId));
        showAlert('Solicitud eliminada exitosamente', 'success');
      } catch (error: any) {
        console.error('Error al eliminar solicitud:', error);
        showAlert(
          'Error al eliminar la solicitud: ' +
            (error.response?.data?.message || 'Error desconocido'),
          'error'
        );
      }
    }
  };

  //Rechazar Solicitud

  const handleRechazarSolicitud = async (
    solicitudId: number,
    clienteNombre: string,
    solicitudEstado: string
  ) => {
    if (solicitudEstado === 'Cancelada') {
      showAlert('No se puede cambiar el estado de una solicitud cancelada', 'warning');
      return;
    }
    const confirmacion = await showConfirm(
      `¿Estás seguro de que deseas cambiar el estado de la solicitud # ${solicitudId} de  ${clienteNombre}?`
    );
    if (confirmacion) {
      if (solicitudEstado !== 'Rechazada') {
        try {
          await axios.put(
            `http://localhost:3000/api/solicitud/${solicitudId}`,
            { estado: 'Rechazado' },
            { withCredentials: true }
          );
          setSolicitudes(
            solicitudes.map((s) =>
              s.id === solicitudId ? { ...s, estado: 'Rechazada' } : s
            )
          );
        } catch (error: any) {
          console.error(error);
          alert(
            'error al cambiar el estado de la solicitud' +
              (error.response?.data?.message || 'error desconocido')
          );
        }
      } else if (solicitudEstado === 'Rechazada') {
        try {
          await axios.put(
            `http://localhost:3000/api/solicitud/${solicitudId}`,
            { estado: 'Pendiente de pago' },
            { withCredentials: true }
          );
          setSolicitudes(
            solicitudes.map((s) =>
              s.id === solicitudId ? { ...s, estado: 'Pendiente de pago' } : s
            )
          );
        } catch (error: any) {
          console.error(error);
          showAlert(
            'error al cambiar el estado de la solicitud' +
              (error.response?.data?.message || 'error desconocido'),
            'error'
          );
        }
      }
    }
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
                    <th>Fecha Solicitud</th>
                    <th>Fecha Evento</th>
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
                      <td>
                        <div className="fecha-admin">
                          <small>Creada:</small>
                          <div>{formatFecha(solicitud.fechaSolicitud)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="fecha-admin">
                          <small>Evento:</small>
                          <div>{formatFecha(solicitud.fechaEvento)}</div>
                        </div>
                      </td>
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
                              showAlert(
                                `Detalles de solicitud #${
                                  solicitud.id
                                }:\n\nCliente: ${solicitud.usuario.nombre} ${
                                  solicitud.usuario.apellido
                                }\nEmail: ${solicitud.usuario.email}\nEstado: ${
                                  solicitud.estado
                                }\nFecha de solicitud: ${formatFecha(
                                  solicitud.fechaSolicitud
                                )}\nFecha del evento: ${formatFecha(
                                  solicitud.fechaEvento
                                )}\nTotal: $${solicitud.montoTotal.toLocaleString(
                                  'es-AR'
                                )}`,
                                'info'
                              );
                            }}
                            title="Ver detalles de la solicitud"
                          >
                            Ver Detalles
                          </button>
                          <button
                            className="btn-eliminar"
                            onClick={() =>
                              handleEliminarSolicitud(
                                solicitud.id,
                                `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`
                              )
                            }
                            title="Eliminar solicitud permanentemente"
                          >
                            Eliminar
                          </button>
                          <button
                            className="btn-rechazar"
                            onClick={() =>
                              handleRechazarSolicitud(
                                solicitud.id,
                                `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`,
                                solicitud.estado
                              )
                            }
                            title="Rechazar Solicitud"
                          >
                            {solicitud.estado !== 'Rechazada'
                              ? 'Rechazar'
                              : 'Deshacer'}
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
