import React, {memo } from 'react';
import {
  Edit2,
} from 'lucide-react';
import './profile.css';

interface UserProfile {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  nombreUsuario: string;
  img?: string;
}

export const ProfileField: React.FC<{
  label: string;
  value: string;
  field: keyof UserProfile;
  icon: React.ReactNode;
  type?: string;
  isEditing: boolean;
  tempValue: string;
  onEditStart: (field: keyof UserProfile, value: string) => void;
  onEditSave: (field: keyof UserProfile) => void;
  onEditCancel: () => void;
  onTempValueChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent, field: keyof UserProfile) => void;
}> = memo(
  ({
    label,
    value,
    field,
    icon,
    type = 'text',
    isEditing,
    tempValue,
    onEditStart,
    onEditSave,
    onEditCancel,
    onTempValueChange,
    onKeyPress,
  }) => (
    <div className="field-card">
      <div className="field-header">
        <div className="field-label-wrapper">
          <div className="field-icon">{icon}</div>
          <span className="field-label">{label}</span>
        </div>
        <button
          onClick={() => onEditStart(field, value)}
          className="field-edit-btn"
          title={`Editar ${label.toLowerCase()}`}
        >
          <Edit2 size={16} />
        </button>
      </div>

      {isEditing ? (
        <div className="field-edit-wrapper">
          <input
            type={type}
            value={tempValue}
            onChange={(e) => onTempValueChange(e.target.value)}
            onKeyDown={(e) => onKeyPress(e, field)}
            className="field-input"
            autoFocus
          />
          <div className="field-edit-buttons">
            <button
              onClick={() => onEditSave(field)}
              className="field-save-btn"
            >
              Guardar
            </button>
            <button onClick={onEditCancel} className="field-cancel-btn">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="field-value">{value}</p>
      )}
    </div>
  )
);