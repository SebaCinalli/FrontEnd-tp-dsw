import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/usercontext';
import { useCart } from '../context/cartcontext';
import './userbadge.css';

export const UserBadge = () => {
  const { user, logout } = useUser();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const handleCartClick = () => {
    navigate('/carrito');
  };

  const hasValidImage = user.img && user.img.trim() !== '' && !imageError;
  const cartItemCount = getItemCount();

  return (
    <div className="user-badge" data-role={user.rol?.toLowerCase()}>
      <div className="user-badge-content">
        <div className="user-avatar-small">
          {hasValidImage ? (
            <img
              src={user.img}
              alt={`${user.nombre} ${user.apellido}`}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="avatar-placeholder-small">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="user-info-small">
          <span className="user-name-small">
            {user.nombre} {user.apellido}
          </span>
          <span className="user-role-small">{user.rol}</span>
        </div>

        {/* Botón del carrito - solo para clientes */}
        {user.rol !== 'administrador' && (
          <button
            className="cart-btn-small"
            onClick={handleCartClick}
            title="Ver carrito"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9"
                cy="21"
                r="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="20"
                cy="21"
                r="1"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m1 1 4 4 6.5 13h8.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 8h13l-1.5 6h-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-count">{cartItemCount}</span>
            )}
          </button>
        )}

        <button
          className="logout-btn-small"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="16,17 21,12 16,7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="21"
              y1="12"
              x2="9"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
