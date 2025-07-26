import { createContext, useState, useContext, type ReactElement } from "react";


type User = {
  email: string;
  // mas info?
};

type UserContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactElement}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => setUser({ email });
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de UserProvider");
  return context;
};
