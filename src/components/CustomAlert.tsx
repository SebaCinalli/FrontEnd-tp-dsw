import React from 'react';
import './CustomAlert.css';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  message: string;
  type: AlertType;
  isVisible: boolean;
  onClose: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  message,
  type,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`custom-alert-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`custom-alert-container ${type} ${isVisible ? 'show' : ''}`}>
        <div className="custom-alert-icon">{getIcon()}</div>
        <div className="custom-alert-content">
          <p className="custom-alert-message">{message}</p>
        </div>
        <button className="custom-alert-close" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
};
