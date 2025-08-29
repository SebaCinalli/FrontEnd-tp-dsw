import { useState, useEffect } from 'react';
import axios from 'axios';
import './solicitud.css';
import { UserBadge } from '../../components/userbadge';
import { BackToMenu } from '../../components/BackToMenu';
import { useUser } from '../../context/usercontext';

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

export function Solicitud() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudEditando, setSolicitudEditando] = useState<number | null>(
    null
  );
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const { user } = useUser();

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
        // Filtrar solo las solicitudes del usuario actual
        const todasLasSolicitudes = response.data.data || [];
        const solicitudesDelUsuario = todasLasSolicitudes.filter(
          (solicitud: Solicitud) => solicitud.usuario.id === user?.id
        );
        setSolicitudes(solicitudesDelUsuario);
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

    if (user?.id) {
      fetchSolicitudes();
    } else {
      setLoading(false);
      setError('Usuario no identificado');
    }
  }, [user?.id]);

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

  const handleEditarSolicitud = (solicitudId: number, estadoActual: string) => {
    // Solo se puede editar si está en estado "Pendiente de pago" o "Pendiente"
    if (estadoActual === 'Pendiente de pago' || estadoActual === 'Pendiente') {
      setSolicitudEditando(solicitudId);
      setNuevoEstado(estadoActual);
    } else {
      alert(
        'Solo puedes editar solicitudes en estado "Pendiente de pago" o "Pendiente"'
      );
    }
  };

  const handleGuardarCambios = async (solicitudId: number) => {
    try {
      await axios.put(
        `http://localhost:3000/api/solicitud/${solicitudId}`,
        { estado: nuevoEstado },
        { withCredentials: true }
      );

      // Actualizar la lista local
      setSolicitudes(
        solicitudes.map((s) =>
          s.id === solicitudId ? { ...s, estado: nuevoEstado } : s
        )
      );

      setSolicitudEditando(null);
      setNuevoEstado('');
      alert('Solicitud actualizada exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar solicitud:', error);
      alert(
        'Error al actualizar la solicitud: ' +
          (error.response?.data?.message || 'Error desconocido')
      );
    }
  };

  const handleCancelarEdicion = () => {
    setSolicitudEditando(null);
    setNuevoEstado('');
  };

  const puedeEditar = (estado: string) => {
    return estado === 'Pendiente de pago' || estado === 'Pendiente';
  };

  const handleCancelarSolicitud = async (solicitudId: number) => {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas cancelar esta solicitud?\n\nEsta acción cambiará el estado a "Cancelada".'
    );

    if (confirmacion) {
      try {
        await axios.put(
          `http://localhost:3000/api/solicitud/${solicitudId}`,
          { estado: 'Cancelada' },
          { withCredentials: true }
        );

        // Actualizar la lista local
        setSolicitudes(
          solicitudes.map((s) =>
            s.id === solicitudId ? { ...s, estado: 'Cancelada' } : s
          )
        );

        alert('Solicitud cancelada exitosamente');
      } catch (error: any) {
        console.error('Error al cancelar solicitud:', error);
        alert(
          'Error al cancelar la solicitud: ' +
            (error.response?.data?.message || 'Error desconocido')
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="solicitud-container">
        <BackToMenu />
        <UserBadge />
        <div className="solicitud-content">
          <h2>Mis Solicitudes</h2>
          <div className="loading">Cargando solicitudes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solicitud-container">
        <BackToMenu />
        <UserBadge />
        <div className="solicitud-content">
          <h2>Mis Solicitudes</h2>
          <div className="error-message">
            <p>Error: {error}</p>
            {error === 'Usuario no identificado' && (
              <p>Por favor, inicia sesión para ver tus solicitudes.</p>
            )}
            <button
              className="btn-reintentar"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="solicitud-container">
      <BackToMenu />
      <UserBadge />

      <div className="solicitud-content">
        <h2>Mis Solicitudes</h2>

        {solicitudes.length === 0 ? (
          <div className="no-solicitudes">
            <p>No tienes solicitudes registradas</p>
            <p>¡Crea tu primera solicitud desde el carrito!</p>
          </div>
        ) : (
          <div className="solicitudes-container">
            <div className="solicitudes-stats">
              <p>
                Total de solicitudes: <strong>{solicitudes.length}</strong>
              </p>
            </div>

            <div className="solicitudes-grid">
              {solicitudes.map((solicitud) => (
                <div key={solicitud.id} className="solicitud-card">
                  <div className="solicitud-header">
                    <h3>Solicitud #{solicitud.id}</h3>
                    {solicitudEditando === solicitud.id ? (
                      <div className="estado-edicion">
                        <select
                          value={nuevoEstado}
                          onChange={(e) => setNuevoEstado(e.target.value)}
                          className="estado-select"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Pendiente de pago">
                            Pendiente de pago
                          </option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                        <div className="edicion-botones">
                          <button
                            className="btn-guardar"
                            onClick={() => handleGuardarCambios(solicitud.id)}
                          >
                            ✓
                          </button>
                          <button
                            className="btn-cancelar"
                            onClick={handleCancelarEdicion}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="estado-display">
                        {getEstadoBadge(solicitud.estado)}
                      </div>
                    )}
                  </div>

                  <div className="solicitud-info">
                    <div className="fecha">
                      <strong>Fecha:</strong>{' '}
                      {formatFecha(solicitud.fechaSolicitud)}
                    </div>

                    <div className="servicios">
                      <h4>Servicios contratados:</h4>
                      <div className="servicios-lista">
                        {solicitud.dj && (
                          <div className="servicio-item">
                            <span className="servicio-tipo">🎧 DJ:</span>
                            <span className="servicio-nombre">
                              {solicitud.dj.nombreArtistico}
                            </span>
                            {solicitud.montoDj && (
                              <span className="servicio-monto">
                                ${solicitud.montoDj.toLocaleString('es-AR')}
                              </span>
                            )}
                          </div>
                        )}
                        {solicitud.salon && (
                          <div className="servicio-item">
                            <span className="servicio-tipo">🛋️ Salón:</span>
                            <span className="servicio-nombre">
                              {solicitud.salon.nombre}
                            </span>
                            {solicitud.montoSalon && (
                              <span className="servicio-monto">
                                ${solicitud.montoSalon.toLocaleString('es-AR')}
                              </span>
                            )}
                          </div>
                        )}
                        {solicitud.barra && (
                          <div className="servicio-item">
                            <span className="servicio-tipo">🍹 Barra:</span>
                            <span className="servicio-nombre">
                              {solicitud.barra.nombreB}
                            </span>
                            {solicitud.montoBarra && (
                              <span className="servicio-monto">
                                ${solicitud.montoBarra.toLocaleString('es-AR')}
                              </span>
                            )}
                          </div>
                        )}
                        {solicitud.gastronomico && (
                          <div className="servicio-item">
                            <span className="servicio-tipo">
                              🍽️ Gastronómico:
                            </span>
                            <span className="servicio-nombre">
                              {solicitud.gastronomico.nombreG}
                            </span>
                            {solicitud.montoGastro && (
                              <span className="servicio-monto">
                                ${solicitud.montoGastro.toLocaleString('es-AR')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="total">
                      <strong>
                        Total: ${solicitud.montoTotal.toLocaleString('es-AR')}
                      </strong>
                    </div>
                  </div>

                  <div className="solicitud-acciones">
                    <div className="acciones-normales">
                      {solicitudEditando !== solicitud.id && (
                        <>
                          <button
                            className={`btn-editar ${
                              !puedeEditar(solicitud.estado) ? 'disabled' : ''
                            }`}
                            onClick={() =>
                              handleEditarSolicitud(
                                solicitud.id,
                                solicitud.estado
                              )
                            }
                            disabled={!puedeEditar(solicitud.estado)}
                            title="Editar estado de la solicitud"
                          >
                            Estado
                          </button>
                          <button
                            className={`btn-cancelar-solicitud ${
                              solicitud.estado === 'Cancelada' ? 'disabled' : ''
                            }`}
                            onClick={() =>
                              handleCancelarSolicitud(solicitud.id)
                            }
                            disabled={solicitud.estado === 'Cancelada'}
                            title="Cancelar solicitud"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Solicitud;
