import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { useAlert } from './alertcontext';

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
  addItem: (item: CartItem) => boolean;
  removeItem: (id: number, type: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  isInCart: (id: number, type: string) => boolean;
  isEmpty: () => boolean;
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
  // Hacer useAlert opcional para evitar problemas de inicialización
  let showAlert: ((message: string, type?: any) => void) | undefined;
  try {
    const alert = useAlert();
    showAlert = alert.showAlert;
  } catch (e) {
    // Si AlertProvider no está disponible, usar alert nativo como fallback
    showAlert = (message: string) => alert(message);
  }
  
  const [items, setItems] = useState<CartItem[]>([]);

  // Ref para leer el estado actual sin depender de closures
  const itemsRef = useRef<CartItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Ref para evitar mostrar el mismo alert varias veces en llamadas rápidas
  const lastAlertRef = useRef<{ type?: string; time: number }>({
    type: undefined,
    time: 0,
  });

  // Recuperar items de localStorage al montar
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('cartItems');
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems) as CartItem[];
        setItems(parsedItems);
      }
    } catch (err: any) {
      console.error(err.message);
    }
  }, []);

  // Guardar items en localStorage cada vez que cambien
  useEffect(() => {
    try {
      if (items.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify(items));
      } else {
        localStorage.removeItem('cartItems');
      }
    } catch (error) {
      console.error('Error al guardar items del carrito en localStorage:', error);
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    const existsNow = itemsRef.current.find(
      (cartItem) => cartItem.type === item.type
    );
    if (existsNow) {
      const now = Date.now();
      if (
        lastAlertRef.current.type === item.type &&
        now - lastAlertRef.current.time < 800
      ) {
        return false;
      }
      lastAlertRef.current = { type: item.type, time: now };
      if (showAlert) {
        showAlert('tipo de servicio ya agregado', 'warning');
      }
      return false;
    }

    setItems((prevItems) => {
      const already = prevItems.find((cartItem) => cartItem.type === item.type);
      if (already) return prevItems;
      return [...prevItems, item];
    });

    return true;
  };

  const removeItem = (id: number, type: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.type === type))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cartItems');
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

  const isEmpty = () => {
    return items.length === 0;
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalPrice,
    getItemCount,
    isInCart,
    isEmpty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
