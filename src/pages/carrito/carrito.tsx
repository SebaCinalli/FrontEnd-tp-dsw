import React from 'react';
import { useCart } from '../../context/cartcontext';
import { UserBadge } from '../../components/userbadge';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/usercontext';
import axios from 'axios';
import './carrito.css';
import { useEventDate } from '../../context/eventdatecontext';

export const Carrito: React.FC = () => {
  const { items, removeItem, clearCart, getTotalPrice, getItemCount } =
    useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const { eventDate } = useEventDate();

  const buildImageUrl = (fileName: string | undefined, type: string) => {
    if (!fileName) return '/placeholder-image.svg';
    if (fileName.startsWith('http')) return fileName;
    return `http://localhost:3000/uploads/${type}s/${fileName}`;
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'salon':
        return 'Salón';
      case 'barra':
        return 'Barra';
      case 'dj':
        return 'DJ';
      case 'gastronomico':
        return 'Gastronómico';
      default:
        return type;
    }
  };

  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    if (!user) {
      alert('Debes estar logueado para realizar una solicitud');
      return;
    }

    if (!eventDate) {
      alert(
        'Seleccioná una fecha para tu evento desde el menú principal antes de continuar.'
      );
      navigate('/');
      return;
    }

    try {
      // Helpers para formatear fechas a DD/MM/YYYY
      const formatIsoToDMY = (iso: string) => {
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
      };
      const formatDateToDMY = (date: Date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      };
      // Separar servicios por tipo
      const serviciosPorTipo = {
        dj: items.find((item) => item.type === 'dj'),
        salon: items.find((item) => item.type === 'salon'),
        barra: items.find((item) => item.type === 'barra'),
        gastronomico: items.find((item) => item.type === 'gastronomico'),
      };

      const solicitudData: any = {
        usuario: user.id,
        estado: 'pendiente de pago',
        // fecha de registro (hoy) en formato DD/MM/YYYY
        fechaSolicitud: formatDateToDMY(new Date()),
        // fecha del evento elegida en el menú en formato DD/MM/YYYY
        fechaEvento: formatIsoToDMY(eventDate),
      };

      // Agregar solo los servicios que están en el carrito
      if (serviciosPorTipo.dj) {
        solicitudData.dj = serviciosPorTipo.dj.id;
      }
      if (serviciosPorTipo.salon) {
        solicitudData.salon = serviciosPorTipo.salon.id;
      }
      if (serviciosPorTipo.barra) {
        solicitudData.barra = serviciosPorTipo.barra.id;
      }
      if (serviciosPorTipo.gastronomico) {
        solicitudData.gastronomico = serviciosPorTipo.gastronomico.id;
      }

      console.log('Enviando solicitud:', solicitudData);

      // Enviar la solicitud al backend
      const response = await axios.post(
        'http://localhost:3000/api/solicitud',
        solicitudData,
        { withCredentials: true }
      );

      if (response.status === 201 || response.status === 200) {
        alert('¡Solicitud creada exitosamente! Estado: Pendiente de pago');
        clearCart(); // Limpiar el carrito después de crear la solicitud
        navigate('/'); // Redirigir al menú principal
      }
    } catch (error: any) {
      console.error('Error al crear la solicitud:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al crear la solicitud';

      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="carrito-container">
      <UserBadge />

      <div className="carrito-content">
        <div className="carrito-header">
          <h2>Mi Carrito de Compras</h2>
          <button className="volver-btn" onClick={() => navigate('/')}>
            ← Volver al Menú
          </button>
        </div>

        {items.length === 0 ? (
          <div className="carrito-vacio">
            <div className="vacio-icon">🛒</div>
            <h3>Tu carrito está vacío</h3>
            <p>¡Agrega algunos servicios para comenzar!</p>
            <button
              className="continuar-comprando-btn"
              onClick={() => navigate('/')}
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="carrito-info">
              <p className="items-count">
                {getItemCount()} elemento(s) en tu carrito
              </p>
              <button className="limpiar-carrito-btn" onClick={clearCart}>
                Limpiar Carrito
              </button>
            </div>

            <div className="carrito-items">
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} className="carrito-item">
                  <div className="item-imagen">
                    <img
                      src={buildImageUrl(item.image, item.type)}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                  </div>

                  <div className="item-info">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      <span className="item-type">
                        {getTypeDisplayName(item.type)}
                      </span>
                    </div>

                    <div className="item-details">
                      {item.type === 'salon' && (
                        <>
                          <p>Capacidad: {item.details.capacidad} personas</p>
                          <p>Zona: {item.details.zona}</p>
                        </>
                      )}
                      {item.type === 'barra' && (
                        <>
                          <p>Tipo de Bebida: {item.details.tipoBebida}</p>
                          <p>Zona: {item.details.zona}</p>
                        </>
                      )}
                      {item.type === 'dj' && (
                        <>
                          <p>Estado: {item.details.estado}</p>
                          <p>Zona: {item.details.zona}</p>
                        </>
                      )}
                      {item.type === 'gastronomico' && (
                        <>
                          <p>Tipo de Comida: {item.details.tipoComida}</p>
                          <p>Zona: {item.details.zona}</p>
                        </>
                      )}
                    </div>

                    <div className="item-precio">
                      ${item.price.toLocaleString('es-AR')}
                    </div>
                  </div>

                  <div className="item-actions">
                    <button
                      className="eliminar-item-btn"
                      onClick={() => removeItem(item.id, item.type)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="carrito-resumen">
              <div className="resumen-content">
                <div className="total-section">
                  <div className="total-row">
                    <span className="total-label">Subtotal:</span>
                    <span className="total-value">
                      ${getTotalPrice().toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="total-row total-final">
                    <span className="total-label">Total:</span>
                    <span className="total-value">
                      ${getTotalPrice().toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button
                    className="continuar-comprando-btn secondary"
                    onClick={() => navigate('/')}
                  >
                    Continuar Comprando
                  </button>
                  <button
                    className="proceder-solicitud-btn"
                    onClick={handleProceedToCheckout}
                  >
                    Proceder con Solicitud
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
