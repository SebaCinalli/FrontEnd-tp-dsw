import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type EventDateContextValue = {
  eventDate: string | null;
  setEventDate: (date: string | null) => void;
  clearEventDate: () => void;
};

const EventDateContext = createContext<EventDateContextValue | undefined>(
  undefined
);

export function EventDateProvider({ children }: { children: React.ReactNode }) {
  const [eventDate, setEventDateState] = useState<string | null>(null);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem('eventDate');
    if (stored) setEventDateState(stored);
  }, []);

  const setEventDate = (date: string | null) => {
    setEventDateState(date);
    if (date) {
      localStorage.setItem('eventDate', date);
    } else {
      localStorage.removeItem('eventDate');
    }
  };

  const clearEventDate = () => setEventDate(null);

  const value = useMemo(
    () => ({ eventDate, setEventDate, clearEventDate }),
    [eventDate]
  );

  return (
    <EventDateContext.Provider value={value}>
      {children}
    </EventDateContext.Provider>
  );
}

export function useEventDate() {
  const ctx = useContext(EventDateContext);
  if (!ctx)
    throw new Error('useEventDate debe usarse dentro de EventDateProvider');
  return ctx;
}
