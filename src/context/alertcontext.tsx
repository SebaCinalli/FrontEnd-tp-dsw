import React, { createContext, useContext, useState, useCallback } from 'react';
import { CustomAlert, type AlertType} from '../components/CustomAlert';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe usarse dentro de un AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState({
    message: '',
    type: 'info' as AlertType,
    isVisible: false,
  });

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    setAlertState({
      message,
      type,
      isVisible: true,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <CustomAlert
        message={alertState.message}
        type={alertState.type}
        isVisible={alertState.isVisible}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
};
