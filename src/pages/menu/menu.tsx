import React from "react";
import "./menu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCocktail,
  faUtensils,
  faHeadphones,
  faCouch,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

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
  title = "Menú Principal",
  onItemClick,
}) => {
  const handleItemClick = (item: MenuItem) => {
    
    if (onItemClick) {
      onItemClick(item);
    }

    item.onClick();
  };

  const menuItems: MenuItem[] = [
    {
      id: "barra",
      icon: faCocktail,
      tooltip: "Reservar servicio de coctelería",
      onClick: () => console.log("Servicio de coctelería seleccionado"),
    },
    {
      id: "gastronomico",
      icon: faUtensils,
      tooltip: "Reservar servicio Gastronómico",
      onClick: () => console.log("Servicio gastronómico seleccionado"),
    },
    {
      id: "dj",
      icon: faHeadphones,
      tooltip: "Reservar DJ",
      onClick: () => console.log("DJ seleccionado"),
    },
    {
      id: "salon",
      icon: faCouch,
      tooltip: "Reservar Salón",
      onClick: () => console.log("Salón seleccionado"),
    },
    {
      id: "carrito",
      icon: faShoppingCart, //codigo de biblioteca usada para el carrito
      tooltip: "Mi selección",
      onClick: () => console.log("Mostrando carrito"),
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
                item.id === "carrito" ? "cart-item" : ""
              }`}
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

export default MenuMain;



//iconos pagina web https://fontawesome.com/search?ip=classic&s=solid&o=r