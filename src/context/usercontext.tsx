import { createContext, useState, useContext, type ReactElement } from 'react';
import axios from 'axios';

type User = {
  email: string;
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
  img: string;
};

type UserContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  existsToken: boolean;
  checkToken: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null);
  const [existsToken, setExistsToken] = useState<boolean>(false);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Llamar al endpoint de logout del servidor para limpiar las cookies
      await axios.post(
        'http://localhost:3000/api/usuario/logout',
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
    } finally {
      // Siempre limpiar el estado local, incluso si falla la llamada al servidor
      setUser(null);
      setExistsToken(false);
    }
  };

  const checkToken = async () => {
    const response = await axios.post(
      'http://localhost:3000/api/usuario/verify',
      {},
      { withCredentials: true }
    );
    if (response.status === 200 && response.data) {
      setExistsToken(true);
      setUser({
        email: response.data.email,
        id: response.data.id,
        username: response.data.username,
        nombre: response.data.nombre,
        apellido: response.data.apellido,
        rol: response.data.rol,
        img: response.data.img || '',
      });
    }
  };

  return (
    <UserContext.Provider
      value={{ user, login, logout, existsToken, checkToken }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider');
  return context;
};
