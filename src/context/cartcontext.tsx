import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
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
  addItem: (item: CartItem) => boolean;
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
  // Ref para leer el estado actual sin depender de closures (evita race conditions)
  const itemsRef = useRef<CartItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Ref para evitar mostrar el mismo alert varias veces en llamadas rápidas
  const lastAlertRef = useRef<{ type?: string; time: number }>({
    type: undefined,
    time: 0,
  });

  const addItem = (item: CartItem) => {
    // Primera verificación rápida contra el estado actual (sin entrar al updater)
    const existsNow = itemsRef.current.find(
      (cartItem) => cartItem.type === item.type
    );
    if (existsNow) {
      const now = Date.now();
      // Evitar alert duplicado en llamadas inmediatas (p. ej. StrictMode double-invoke)
      if (
        lastAlertRef.current.type === item.type &&
        now - lastAlertRef.current.time < 800
      ) {
        return false;
      }
      lastAlertRef.current = { type: item.type, time: now };
      alert('tipo de servicio ya agregado');
      return false;
    }

    // Hacemos la actualización usando la función con prev para prevenir duplicados por race
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
