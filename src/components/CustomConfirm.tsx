import React from 'react';
import './CustomConfirm.css';

interface CustomConfirmProps {
  message: string;
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CustomConfirm: React.FC<CustomConfirmProps> = ({ 
  message, 
  isVisible, 
  onConfirm, 
  onCancel 
}) => {
  if (!isVisible) return null;

  return (
    <div className="custom-confirm-overlay" onClick={onCancel}>
      <div 
        className="custom-confirm-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="custom-confirm-icon">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        
        <p className="custom-confirm-message">{message}</p>
        
        <div className="custom-confirm-buttons">
          <button 
            className="custom-confirm-btn custom-confirm-cancel"
            onClick={onCancel}
            autoFocus
          >
            Cancelar
          </button>
          <button 
            className="custom-confirm-btn custom-confirm-confirm"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
