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
  const [solicitudEditandoServicios, setSolicitudEditandoServicios] = useState<
    number | null
  >(null);
  const [serviciosDisponibles, setServiciosDisponibles] = useState<any>({
    djs: [],
    salones: [],
    barras: [],
    gastronomicos: [],
  });
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<{
    djId?: number | null;
    salonId?: number | null;
    barraId?: number | null;
    gastronomicoId?: number | null;
  }>({});
  const { user } = useUser();

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/solicitud', {
        withCredentials: true,
      });
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

  useEffect(() => {
    if (user?.id) {
      fetchSolicitudes();
    } else {
      setLoading(false);
      setError('Usuario no identificado');
    }
  }, [user?.id]);

  const fetchServiciosDisponibles = async () => {
    try {
      console.log('Iniciando fetchServiciosDisponibles...');
      const [djResponse, salonResponse, barraResponse, gastronomicoResponse] =
        await Promise.all([
          axios.get('http://localhost:3000/api/dj', {
            withCredentials: true,
          }),
          axios.get('http://localhost:3000/api/salon', {
            withCredentials: true,
          }),
          axios.get('http://localhost:3000/api/barra', {
            withCredentials: true,
          }),
          axios.get('http://localhost:3000/api/gastronomico', {
            withCredentials: true,
          }),
        ]);

      console.log('Respuestas recibidas:', {
        djs: djResponse.data,
        salones: salonResponse.data,
        barras: barraResponse.data,
        gastronomicos: gastronomicoResponse.data,
      });

      const servicios = {
        djs: djResponse.data.data || djResponse.data,
        salones: salonResponse.data.data || salonResponse.data,
        barras: barraResponse.data.data || barraResponse.data,
        gastronomicos:
          gastronomicoResponse.data.data || gastronomicoResponse.data,
      };

      console.log('Servicios procesados:', servicios);
      setServiciosDisponibles(servicios);
    } catch (error) {
      console.error('Error al cargar servicios disponibles:', error);
    }
  };

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

  const puedeEditar = (estado: string) => {
    console.log(
      'Estado de solicitud:',
      `"${estado}"`,
      'Longitud:',
      estado.length,
      'Puede editar:',
      estado === 'Pendiente de pago'
    );
    // Hacer comparación más tolerante
    const estadoNormalizado = estado?.trim().toLowerCase();
    const puedeEditarResult =
      estadoNormalizado === 'pendiente de pago' ||
      estado === 'Pendiente de pago';
    console.log(
      'Estado normalizado:',
      `"${estadoNormalizado}"`,
      'Resultado final:',
      puedeEditarResult
    );
    return puedeEditarResult;
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

  const handleEditarServicios = async (solicitudId: number) => {
    console.log('handleEditarServicios ejecutado para solicitud:', solicitudId);
    setSolicitudEditandoServicios(solicitudId);

    console.log('Llamando a fetchServiciosDisponibles...');
    await fetchServiciosDisponibles();

    // Encontrar la solicitud actual y establecer los servicios seleccionados
    const solicitudActual = solicitudes.find((s) => s.id === solicitudId);
    if (solicitudActual) {
      const serviciosIniciales = {
        djId: solicitudActual.dj?.id || null,
        salonId: solicitudActual.salon?.id || null,
        barraId: solicitudActual.barra?.id || null,
        gastronomicoId: solicitudActual.gastronomico?.id || null,
      };

      console.log('Solicitud actual:', solicitudActual);
      console.log('Servicios iniciales establecidos:', serviciosIniciales);

      setServiciosSeleccionados(serviciosIniciales);
    } else {
      console.error('No se encontró la solicitud con ID:', solicitudId);
    }
  };

  const handleGuardarServicios = async (solicitudId: number) => {
    try {
      const updateData: any = {};

      // Mapear los nombres de las propiedades para que coincidan con lo que espera el backend
      // El backend espera: dj, salon, barra, gastronomico (sin el sufijo Id)
      if ('djId' in serviciosSeleccionados) {
        updateData.dj = serviciosSeleccionados.djId;
      }
      if ('salonId' in serviciosSeleccionados) {
        updateData.salon = serviciosSeleccionados.salonId;
      }
      if ('barraId' in serviciosSeleccionados) {
        updateData.barra = serviciosSeleccionados.barraId;
      }
      if ('gastronomicoId' in serviciosSeleccionados) {
        updateData.gastronomico = serviciosSeleccionados.gastronomicoId;
      }

      console.log('Servicios seleccionados:', serviciosSeleccionados);
      console.log('Datos enviados al backend:', updateData);

      const updateResponse = await axios.put(
        `http://localhost:3000/api/solicitud/${solicitudId}`,
        updateData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Respuesta exitosa del backend:', updateResponse.data);

      // Recargar las solicitudes para mostrar los cambios
      await fetchSolicitudes();

      setSolicitudEditandoServicios(null);
      setServiciosSeleccionados({});
      alert('Servicios actualizados exitosamente');
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Datos de la respuesta de error:', error.response?.data);
      console.error('Estado HTTP:', error.response?.status);
      console.error('Headers de respuesta:', error.response?.headers);

      let errorMessage = 'Error desconocido';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert('Error al actualizar los servicios: ' + errorMessage);
    }
  };

  const handleCancelarEdicionServicios = () => {
    setSolicitudEditandoServicios(null);
    setServiciosSeleccionados({});
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
                    <div className="estado-display">
                      {getEstadoBadge(solicitud.estado)}
                    </div>
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
                      {solicitudEditandoServicios !== solicitud.id && (
                        <>
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
                          <button
                            className={`btn-editar-servicios ${
                              !puedeEditar(solicitud.estado) ? 'disabled' : ''
                            }`}
                            onClick={() => {
                              console.log(
                                'Botón Editar Servicios clickeado para solicitud:',
                                solicitud.id
                              );
                              handleEditarServicios(solicitud.id);
                            }}
                            disabled={!puedeEditar(solicitud.estado)}
                            title="Editar servicios de la solicitud"
                          >
                            Editar Servicios
                          </button>
                        </>
                      )}
                    </div>

                    {/* Interfaz de edición de servicios */}
                    {solicitudEditandoServicios === solicitud.id && (
                      <div className="edicion-servicios">
                        <h4>Editar Servicios:</h4>

                        <div className="servicios-edicion">
                          <div className="servicio-edicion">
                            <label>DJ:</label>
                            <select
                              value={serviciosSeleccionados.djId ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                console.log('Cambiando DJ a:', value);
                                setServiciosSeleccionados({
                                  ...serviciosSeleccionados,
                                  djId: value,
                                });
                              }}
                            >
                              <option value="">Sin DJ</option>
                              {serviciosDisponibles.djs.map((dj: any) => (
                                <option key={dj.id} value={dj.id}>
                                  {dj.nombreArtistico} - $
                                  {dj.montoDj
                                    ? dj.montoDj.toLocaleString('es-AR')
                                    : 'Sin precio'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="servicio-edicion">
                            <label>Salón:</label>
                            <select
                              value={serviciosSeleccionados.salonId ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                console.log('Cambiando Salón a:', value);
                                setServiciosSeleccionados({
                                  ...serviciosSeleccionados,
                                  salonId: value,
                                });
                              }}
                            >
                              <option value="">Sin Salón</option>
                              {serviciosDisponibles.salones.map(
                                (salon: any) => (
                                  <option key={salon.id} value={salon.id}>
                                    {salon.nombre} - $
                                    {salon.montoS
                                      ? salon.montoS.toLocaleString('es-AR')
                                      : 'Sin precio'}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div className="servicio-edicion">
                            <label>Barra:</label>
                            <select
                              value={serviciosSeleccionados.barraId ?? ''}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                console.log('Cambiando Barra a:', value);
                                setServiciosSeleccionados({
                                  ...serviciosSeleccionados,
                                  barraId: value,
                                });
                              }}
                            >
                              <option value="">Sin Barra</option>
                              {serviciosDisponibles.barras.map((barra: any) => (
                                <option key={barra.id} value={barra.id}>
                                  {barra.nombreB} - $
                                  {barra.montoB
                                    ? barra.montoB.toLocaleString('es-AR')
                                    : 'Sin precio'}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="servicio-edicion">
                            <label>Gastro:</label>
                            <select
                              value={
                                serviciosSeleccionados.gastronomicoId ?? ''
                              }
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                console.log('Cambiando Gastronómico a:', value);
                                setServiciosSeleccionados({
                                  ...serviciosSeleccionados,
                                  gastronomicoId: value,
                                });
                              }}
                            >
                              <option value="">Sin Gastronómico</option>
                              {serviciosDisponibles.gastronomicos.map(
                                (gastro: any) => (
                                  <option key={gastro.id} value={gastro.id}>
                                    {gastro.nombreG} - $
                                    {gastro.montoG
                                      ? gastro.montoG.toLocaleString('es-AR')
                                      : 'Sin precio'}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="edicion-botones">
                          <button
                            className="btn-guardar"
                            onClick={() => handleGuardarServicios(solicitud.id)}
                          >
                            Guardar Cambios
                          </button>
                          <button
                            className="btn-cancelar"
                            onClick={handleCancelarEdicionServicios}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
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
