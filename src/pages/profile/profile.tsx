
import React, { useState } from 'react';
import { Edit2, User, Mail, Phone, AtSign, Shield } from 'lucide-react';
import './profile.css';

interface UserProfile {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  nombreUsuario: string;
  img?: string;
}

export const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nombreUsuario: '',
    img: ''
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleEditStart = (field: keyof UserProfile, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const handleEditSave = (field: keyof UserProfile) => {
    setUser(prev => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
    setTempValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: keyof UserProfile) => {
    if (e.key === 'Enter') {
      handleEditSave(field);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const ProfileField: React.FC<{
    label: string;
    value: string;
    field: keyof UserProfile;
    icon: React.ReactNode;
    type?: string;
  }> = ({ label, value, field, icon, type = 'text' }) => (
    <div className="field-card">
      <div className="field-header">
        <div className="field-label-wrapper">
          <div className="field-icon">
            {icon}
          </div>
          <span className="field-label">
            {label}
          </span>
        </div>
        <button
          onClick={() => handleEditStart(field, value)}
          className="field-edit-btn"
          title={`Editar ${label.toLowerCase()}`}
        >
          <Edit2 size={16} />
        </button>
      </div>
      
      {editingField === field ? (
        <div className="field-edit-wrapper">
          <input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, field)}
            className="field-input"
            autoFocus
          />
          <div className="field-edit-buttons">
            <button
              onClick={() => handleEditSave(field)}
              className="field-save-btn"
            >
              Guardar
            </button>
            <button
              onClick={handleEditCancel}
              className="field-cancel-btn"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p className="field-value">
          {value}
        </p>
      )}
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">
            Mi Perfil
          </h1>
          <p className="profile-subtitle">
            Gestiona tu información personal
          </p>
        </div>

        {/* Profile Image Section */}
        <div className="profile-image-section">
          <div className="profile-image-content">
            <div className="profile-image-wrapper">
              <div className="profile-image">
                {user.img ? (
                  <img
                    src={user.img}
                    alt="Foto de perfil"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <User size={48} color="#ffffff" />
                  </div>
                )}
              </div>
              <button className="profile-image-edit-btn">
                <Edit2 size={16} />
              </button>
            </div>
            
            <h2 className="profile-name">
              {user.nombre} {user.apellido}
            </h2>
            
            <p className="profile-username">
              @{user.nombreUsuario}
            </p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="profile-fields-grid">
          <ProfileField
            label="Nombre"
            value={user.nombre}
            field="nombre"
            icon={<User size={20} />}
          />
          
          <ProfileField
            label="Apellido"
            value={user.apellido}
            field="apellido"
            icon={<User size={20} />}
          />
          
          <ProfileField
            label="Email"
            value={user.email}
            field="email"
            icon={<Mail size={20} />}
            type="email"
          />
          
          <ProfileField
            label="Teléfono"
            value={user.telefono}
            field="telefono"
            icon={<Phone size={20} />}
            type="tel"
          />
          
          <ProfileField
            label="Nombre de Usuario"
            value={user.nombreUsuario}
            field="nombreUsuario"
            icon={<AtSign size={20} />}
          />
        </div>
        </div>
        {/* Save All Changes Button */}
        <div className="save-all-wrapper">
          <button className="save-all-btn">
            Guardar Cambios
          </button>
        </div>
      </div>
  );
};

