import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Tipos para los elementos del carrito
export interface CartItem {
  id: number;
  type: 'salon' | 'barra' | 'dj' | 'gastronomico';
  name: string;
  price: number;
  image?: string;
  details: Record<string, any>; // Para guardar información específica de cada tipo
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number, type: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  isInCart: (id: number, type: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // Verificar si el elemento ya está en el carrito
      const existingItem = prevItems.find(
        (cartItem) => cartItem.type === item.type
      );

      if (existingItem) {
        // Si ya existe, no lo agregamos de nuevo
        alert('tipo de servicio ya agregado')
        return prevItems;
      }

      // Si no existe, lo agregamos
      return [...prevItems, item];
    });
  };

  const removeItem = (id: number, type: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  const isInCart = (id: number, type: string) => {
    return items.some((item) => item.id === id && item.type === type);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalPrice,
    getItemCount,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
