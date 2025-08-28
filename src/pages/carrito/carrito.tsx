import React from 'react';
import { useCart } from '../../context/cartcontext';
import { UserBadge } from '../../components/userbadge';
import { useNavigate } from 'react-router-dom';
import './carrito.css';

export const Carrito: React.FC = () => {
  const { items, removeItem, clearCart, getTotalPrice, getItemCount } =
    useCart();
  const navigate = useNavigate();

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

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Aquí puedes implementar la lógica para proceder con la solicitud
    alert('Funcionalidad de solicitud en desarrollo');
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
