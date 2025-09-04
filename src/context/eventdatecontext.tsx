import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface EventDateContextType {
  eventDate: string | null;
  setEventDate: (date: string | null) => void;
}

const EventDateContext = createContext<EventDateContextType | undefined>(undefined);

export const useEventDate = () => {
  const context = useContext(EventDateContext);
  if (!context) throw new Error('useEventDate debe usarse dentro de EventDateProvider');
  return context;
};

interface Props {
  children: ReactNode;
}

export const EventDateProvider: React.FC<Props> = ({ children }) => {
  const [eventDate, setEventDateState] = useState<string | null>(null);

  // Cargar fecha del localStorage al inicio
  useEffect(() => {
    const storedDate = localStorage.getItem('eventDate');
    if (storedDate) setEventDateState(storedDate);
  }, []);

  // Guardar fecha en localStorage cuando cambie
  const setEventDate = (date: string | null) => {
    setEventDateState(date);
    if (date) {
      localStorage.setItem('eventDate', date);
    } else {
      localStorage.removeItem('eventDate');
    }
  };

  return (
    <EventDateContext.Provider value={{ eventDate, setEventDate }}>
      {children}
    </EventDateContext.Provider>
  );
};
