import React, { useEffect, useMemo, useState } from 'react';
import './menu.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUser } from '../../context/usercontext';
import {
  faCocktail,
  faUtensils,
  faHeadphones,
  faHouse,
  faShoppingCart,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { UserBadge } from '../../components/userbadge';
import { useEventDate } from '../../context/eventdatecontext';
import { useCart } from '../../context/cartcontext';
import { useAlert } from '../../context/alertcontext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface MenuItem {
  id: string;
  icon: any;
  tooltip: string;
  onClick: () => void;
}

const MenuMain: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isEmpty, items } = useCart();
  const { eventDate, setEventDate } = useEventDate();
  const { showAlert } = useAlert();
  const [localDate, setLocalDate] = useState<string>('');

  const selectedDateObj = useMemo(
    () => (localDate ? new Date(localDate + 'T00:00:00') : null),
    [localDate]
  );

  const isCartEmpty = isEmpty();
  const hasCart = items.length > 0; // Nuevo: detecta si hay carrito activo

  useEffect(() => {
    setLocalDate(eventDate || '');
  }, [eventDate]);

  const handleItemClick = (item: MenuItem) => {
    const needsDate = ['barra', 'gastronomico', 'dj', 'salon', 'carrito'].includes(item.id);

    // Permitir avanzar si hay carrito aunque no haya fecha
    if (needsDate && !localDate && !hasCart) {
      showAlert('Seleccioná una fecha para tu evento antes de continuar.', 'warning');
      return;
    }

    if (needsDate && localDate && localDate !== eventDate) {
      setEventDate(localDate);
    }

    item.onClick();
  };

  const menuItems: MenuItem[] = [
    { id: 'barra', icon: faCocktail, tooltip: 'Reservar servicio de coctelería', onClick: () => navigate('/barra') },
    { id: 'gastronomico', icon: faUtensils, tooltip: 'Reservar servicio Gastronómico', onClick: () => navigate('/gastronomico') },
    { id: 'dj', icon: faHeadphones, tooltip: 'Reservar DJ', onClick: () => navigate('/dj') },
    { id: 'salon', icon: faHouse, tooltip: 'Reservar Salón', onClick: () => navigate('/salon') },
    { id: 'carrito', icon: faShoppingCart, tooltip: 'Mi selección', onClick: () => navigate('/carrito') },
    { id: 'solicitud', icon: faList, tooltip: 'Mis solicitudes', onClick: () => navigate('/solicitud') },
  ];

  return (
    <div className="menu-body">
      <UserBadge />
      <div className="container">
        <h2>Menú Principal</h2>

        <div className="event-date-picker" style={{ marginBottom: 16 }}>
          <label htmlFor="event-date" style={{ color: '#fff', display: 'block', marginBottom: 6 }}>
            Fecha del evento
            {!isCartEmpty && <span style={{ fontSize: '0.8em', marginLeft: '8px', opacity: 0.7 }}>
              (No se puede modificar con servicios en el carrito)
            </span>}
          </label>

          <DatePicker
            id="event-date"
            selected={selectedDateObj}
            onChange={(date: Date | null) => {
              if (!isCartEmpty) {
                showAlert('No podés cambiar la fecha mientras tengas servicios en el carrito. Vaciá el carrito primero.', 'warning');
                return;
              }
              if (!date) {
                setLocalDate('');
                setEventDate(null);
                return;
              }
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              const iso = `${yyyy}-${mm}-${dd}`;
              setLocalDate(iso);
              setEventDate(iso);
            }}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            className={`date-input ${!isCartEmpty ? 'disabled' : ''}`}
            placeholderText="Seleccioná una fecha"
            popperPlacement="bottom"
            showPopperArrow
            disabled={!isCartEmpty}
          />
        </div>

        <div className="icons-grid menu-client-layout">
          {menuItems.map((item) => {
            const isRestricted = ['barra', 'gastronomico', 'dj', 'salon', 'carrito'].includes(item.id);

            // Nuevo: solo bloquear si no hay usuario o no hay fecha Y no hay carrito
            const isDisabled = isRestricted && (!user || (!localDate && !hasCart));

            return (
              <div
                key={item.id}
                className={`icon-item ${item.id === 'carrito' ? 'cart-item' : ''} ${item.id === 'solicitud' ? 'solicitud-item' : ''}`}
                onClick={() => handleItemClick(item)}
                style={{
                  opacity: isDisabled ? 0.5 : 1,
                  pointerEvents: isDisabled ? 'none' : 'auto',
                }}
              >
                <FontAwesomeIcon icon={item.icon} />
                <div className="tooltip">{item.tooltip}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { MenuMain };
