import { createContext, useState, useContext, type ReactElement } from "react";
import axios from "axios";


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

  const logout = () => {
    setUser(null);
  };

  const checkToken = async () =>{
    const response = await axios.post('http://localhost:3000/api/cliente/verify',{}, {withCredentials: true});
      if(response.status === 200 && response.data){
        setExistsToken(true);
        setUser({
          email: response.data.email,
          id: response.data.id,
          username: response.data.username,
          nombre: response.data.nombre,
          apellido: response.data.apellido,
          rol: response.data.rol,
          img: response.data.img || ''
        });
      }
    }

  return (
    <UserContext.Provider value={{ user, login, logout, existsToken, checkToken }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de UserProvider");
  return context;
};
