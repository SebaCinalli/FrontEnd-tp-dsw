import React from 'react';
import './menuAdmin.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCocktail,
  faUtensils,
  faHeadphones,
  faHouse,
  faList,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';

import { UserBadge } from '../../components/userbadge';

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
  const navigate = useNavigate();

  const handleItemClick = (item: MenuAdminItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
    item.onClick();
  };

  const menuItems: MenuAdminItem[] = [
    {
      id: 'barra',
      icon: faCocktail,
      tooltip: 'Gestionar servicios de coctelería',
      onClick: () => navigate('/barraAdmin'),
    },
    {
      id: 'gastronomico',
      icon: faUtensils,
      tooltip: 'Gestionar servicios Gastronómicos',
      onClick: () => navigate('/gastronomicoAdmin'),
    },
    {
      id: 'dj',
      icon: faHeadphones,
      tooltip: 'Gestionar DJs',
      onClick: () => navigate('/djAdmin'),
    },
    {
      id: 'salon',
      icon: faHouse,
      tooltip: 'Gestionar Salones',
      onClick: () => navigate('/salonAdmin'),
    },
    {
      id: 'zona',
      icon: faMapMarkerAlt,
      tooltip: 'Gestionar Zonas',
      onClick: () => navigate('/zonaAdmin'),
    },
    {
      id: 'solicitud',
      icon: faList,
      tooltip: 'Gestionar Solicitudes',
      onClick: () => navigate('/solicitudAdmin'),
    },
  ];

  return (
    <div className="menu-body">
      <UserBadge />
      <div className="container">
        <h2>{title}</h2>

        <div className="icons-grid">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`icon-item ${
                item.id === 'carrito' ? 'cart-item' : ''
              } ${item.id === 'solicitud' ? 'solicitud-item' : ''}`}
              onClick={() => handleItemClick(item)}
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

export { MenuAdmin };
