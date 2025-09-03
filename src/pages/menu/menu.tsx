import React, { useEffect, useMemo, useState } from 'react';
import './menu.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface MenuItem {
  id: string;
  icon: any; //  FontAwesome icons  es la biblioteca que se está usando
  tooltip: string;
  onClick: () => void;
}

interface MenuMainProps {
  title?: string;
  onItemClick?: (item: MenuItem) => void;
}

const MenuMain: React.FC<MenuMainProps> = ({
  title = 'Menú Principal',
  onItemClick,
}) => {
  const navigate = useNavigate();
  const { eventDate, setEventDate } = useEventDate();
  const [localDate, setLocalDate] = useState<string>('');
  const selectedDateObj = useMemo(
    () => (localDate ? new Date(localDate + 'T00:00:00') : null),
    [localDate]
  );

  // Sincronizar campo local con contexto
  useEffect(() => {
    setLocalDate(eventDate || '');
  }, [eventDate]);

  const handleItemClick = (item: MenuItem) => {
    // Requerir fecha seleccionada para navegar a servicios o carrito
    const needsDate = [
      'barra',
      'gastronomico',
      'dj',
      'salon',
      'carrito',
    ].includes(item.id);
    if (needsDate && !localDate) {
      alert('Seleccioná una fecha para tu evento antes de continuar.');
      return;
    }
    if (needsDate && localDate && localDate !== eventDate) {
      setEventDate(localDate);
    }
    if (onItemClick) {
      onItemClick(item);
    }
    item.onClick();
  };
  const menuItems: MenuItem[] = [
    {
      id: 'barra',
      icon: faCocktail,
      tooltip: 'Reservar servicio de coctelería',
      onClick: () => navigate('/barra'),
    },
    {
      id: 'gastronomico',
      icon: faUtensils,
      tooltip: 'Reservar servicio Gastronómico',
      onClick: () => navigate('/gastronomico'),
    },
    {
      id: 'dj',
      icon: faHeadphones,
      tooltip: 'Reservar DJ',
      onClick: () => navigate('/dj'),
    },
    {
      id: 'salon',
      icon: faHouse,
      tooltip: 'Reservar Salón',
      onClick: () => navigate('/salon'),
    },
    {
      id: 'carrito',
      icon: faShoppingCart, //codigo de biblioteca usada para el carrito
      tooltip: 'Mi selección',
      onClick: () => navigate('/carrito'),
    },
    {
      id: 'solicitud',
      icon: faList,
      tooltip: 'Mis solicitudes',
      onClick: () => navigate('/solicitud'),
    },
  ];

  return (
    <div className="menu-body">
      <UserBadge />
      <div className="container">
        <h2>{title}</h2>

        {/* Selector de fecha del evento */}
        <div className="event-date-picker" style={{ marginBottom: 16 }}>
          <label
            htmlFor="event-date"
            style={{ color: '#fff', display: 'block', marginBottom: 6 }}
          >
            Fecha del evento
          </label>
          <DatePicker
            id="event-date"
            selected={selectedDateObj}
            onChange={(date: Date | null) => {
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
            className="date-input"
            placeholderText="Seleccioná una fecha"
            popperPlacement="bottom"
            showPopperArrow
          />
          {/* Texto de fecha seleccionada removido por requerimiento */}
        </div>

        <div className="icons-grid menu-client-layout">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`icon-item ${
                item.id === 'carrito' ? 'cart-item' : ''
              } ${item.id === 'solicitud' ? 'solicitud-item' : ''}`}
              onClick={() => handleItemClick(item)}
              style={{
                opacity:
                  ['barra', 'gastronomico', 'dj', 'salon', 'carrito'].includes(
                    item.id
                  ) && !localDate
                    ? 0.5
                    : 1,
                pointerEvents:
                  ['barra', 'gastronomico', 'dj', 'salon', 'carrito'].includes(
                    item.id
                  ) && !localDate
                    ? ('none' as const)
                    : 'auto',
              }}
            >
              <FontAwesomeIcon icon={item.icon} />
              <div className="tooltip">{item.tooltip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { MenuMain };

//iconos pagina web https://fontawesome.com/search?ip=classic&s=solid&o=r
