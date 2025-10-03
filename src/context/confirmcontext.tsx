import React, { createContext, useContext, useState, useCallback } from 'react';
import { CustomConfirm } from '../components/CustomConfirm';

interface ConfirmContextType {
  showConfirm: (message: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe usarse dentro de un ConfirmProvider');
  }
  return context;
};

interface ConfirmProviderProps {
  children: React.ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    isVisible: boolean;
    message: string;
    resolver: ((value: boolean) => void) | null;
  }>({
    isVisible: false,
    message: '',
    resolver: null,
  });

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isVisible: true,
        message,
        resolver: resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolver) {
      confirmState.resolver(true);
    }
    setConfirmState({
      isVisible: false,
      message: '',
      resolver: null,
    });
  }, [confirmState.resolver]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolver) {
      confirmState.resolver(false);
    }
    setConfirmState({
      isVisible: false,
      message: '',
      resolver: null,
    });
  }, [confirmState.resolver]);

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <CustomConfirm
        message={confirmState.message}
        isVisible={confirmState.isVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};
