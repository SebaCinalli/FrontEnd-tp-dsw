import React from 'react';
import './menu.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCocktail,
  faUtensils,
  faHeadphones,
  faCouch,
  faShoppingCart,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../context/usercontext';

interface MenuAdminItem {
  id: string;
  icon: any; //  FontAwesome icons  es la biblioteca que se está usando
  tooltip: string;
  onClick: () => void;
}

interface MenuProps {
  title?: string;
  onItemClick?: (item: MenuAdminItem) => void;
}

const MenuAdmin: React.FC<MenuProps> = ({
  title = 'Menú Principal',
  onItemClick,
}) => {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleItemClick = (item: MenuAdminItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    item.onClick();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const menuItems: MenuAdminItem[] = [
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
      icon: faCouch,
      tooltip: 'Reservar Salón',
      onClick: () => navigate('/salon')
    },
    {
      id: 'carrito',
      icon: faShoppingCart, //codigo de biblioteca usada para el carrito
      tooltip: 'Mi selección',
      onClick: () => navigate('/carrito'),
    },
  ];

  return (
    <div className="menu-body">
      <div className="container">
        <h2>{title}</h2>

        <div className="icons-grid">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`icon-item ${
                item.id === 'carrito' ? 'cart-item' : ''
              }`}
              onClick={() => handleItemClick(item)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <div className="tooltip">{item.tooltip}</div>
            </div>
          ))}
        </div>

        <div className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <div className="tooltip">Cerrar sesión</div>
        </div>
      </div>
    </div>
  );
};

export { MenuAdmin };