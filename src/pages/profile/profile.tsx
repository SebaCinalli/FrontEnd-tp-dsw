import React, { useState, useEffect, useCallback} from 'react';
import {
  Edit2,
  User,
  Mail,
  Phone,
  AtSign,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/usercontext';
import './profile.css';
import { ProfileField } from './profilefield';

interface UserProfile {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  nombreUsuario: string;
  img?: string;
}


export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: contextUser, login } = useUser();

  const [user, setUser] = useState<UserProfile>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nombreUsuario: '',
    img: '',
  });

  const [originalUser, setOriginalUser] = useState<UserProfile>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    nombreUsuario: '',
    img: '',
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [imageError, setImageError] = useState(false); // Cargar datos del usuario del contexto
  useEffect(() => {
    if (contextUser) {
      const userData = {
        nombre: contextUser.nombre || '',
        apellido: contextUser.apellido || '',
        email: contextUser.email || '',
        telefono: '', // Si tienes telefono en el contexto, agregalo aquí
        nombreUsuario: contextUser.username || '',
        img:
          contextUser.img && contextUser.img.trim() !== ''
            ? contextUser.img
            : '',
      };
      setUser(userData);
      setOriginalUser(userData);
      // Resetear el error de imagen cuando se cargan nuevos datos
      setImageError(false);
    }
  }, [contextUser]);

  // Verificar si hay cambios
  useEffect(() => {
    const hasAnyChanges = Object.keys(user).some(
      (key) =>
        user[key as keyof UserProfile] !==
        originalUser[key as keyof UserProfile]
    );
    setHasChanges(hasAnyChanges);
  }, [user, originalUser]);

  const handleBackToMenu = useCallback(() => {
    if (contextUser?.rol === 'Admin') {
      navigate('/menuAdmin');
    } else {
      navigate('/menu');
    }
  }, [contextUser?.rol, navigate]);

  const handleEditStart = useCallback(
    (field: keyof UserProfile, value: string) => {
      setEditingField(field);
      setTempValue(value);
    },
    []
  );

  const handleEditSave = useCallback(
    (field: keyof UserProfile) => {
      setUser((prev) => ({ ...prev, [field]: tempValue }));
      setEditingField(null);
      setTempValue('');
    },
    [tempValue]
  );

  const handleEditCancel = useCallback(() => {
    setEditingField(null);
    setTempValue('');
  }, []);

  const handleTempValueChange = useCallback((value: string) => {
    setTempValue(value);
  }, []);

  const handleCancelAllChanges = useCallback(() => {
    setUser(originalUser);
    setEditingField(null);
    setTempValue('');
  }, [originalUser]);

  const handleSaveAllChanges = useCallback(async () => {
    if (!contextUser) return;

    setIsLoading(true);
    try {
      const updateData = {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        username: user.nombreUsuario,
        // Agrega telefono si tu API lo soporta
        // telefono: user.telefono,
        // img: user.img
      };

      const response = await axios.put(
        `http://localhost:3000/api/usuario/${contextUser.id}`,
        updateData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Actualizar el contexto con los nuevos datos
        const updatedUser = {
          ...contextUser,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          username: user.nombreUsuario,
        };

        login(updatedUser);
        setOriginalUser(user);

        // Mostrar mensaje de éxito (puedes agregar un toast aquí)
        alert('Perfil actualizado correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, [contextUser, user, login]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent, field: keyof UserProfile) => {
      if (e.key === 'Enter') {
        handleEditSave(field);
      } else if (e.key === 'Escape') {
        handleEditCancel();
      }
    },
    [handleEditSave, handleEditCancel]
  );

  // Verificar si tiene imagen válida (igual que en UserBadge)
  const hasValidImage = user.img && user.img.trim() !== '' && !imageError;

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header con botón de volver */}
        <div className="profile-header">
          <button
            className="back-to-menu-btn"
            onClick={handleBackToMenu}
            title="Volver al menú"
          >
            <ArrowLeft size={20} />
            Volver al Menú
          </button>

          <h1 className="profile-title">Mi Perfil</h1>
          <p className="profile-subtitle">Gestiona tu información personal</p>
        </div>

        {/* Profile Image Section */}
        <div className="profile-image-section">
          <div className="profile-image-content">
            <div className="profile-image-wrapper">
              <div className="profile-image">
                {hasValidImage ? (
                  <img
                    src={user.img}
                    alt="Foto de perfil"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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

            <p className="profile-username">@{user.nombreUsuario}</p>
          </div>
        </div>

        {/* Profile Fields */}
        <div className="profile-fields-grid">
          <ProfileField
            label="Nombre"
            value={user.nombre}
            field="nombre"
            icon={<User size={20} />}
            isEditing={editingField === 'nombre'}
            tempValue={tempValue}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onTempValueChange={handleTempValueChange}
            onKeyPress={handleKeyPress}
          />

          <ProfileField
            label="Apellido"
            value={user.apellido}
            field="apellido"
            icon={<User size={20} />}
            isEditing={editingField === 'apellido'}
            tempValue={tempValue}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onTempValueChange={handleTempValueChange}
            onKeyPress={handleKeyPress}
          />

          <ProfileField
            label="Email"
            value={user.email}
            field="email"
            icon={<Mail size={20} />}
            type="email"
            isEditing={editingField === 'email'}
            tempValue={tempValue}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onTempValueChange={handleTempValueChange}
            onKeyPress={handleKeyPress}
          />

          <ProfileField
            label="Teléfono"
            value={user.telefono}
            field="telefono"
            icon={<Phone size={20} />}
            type="tel"
            isEditing={editingField === 'telefono'}
            tempValue={tempValue}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onTempValueChange={handleTempValueChange}
            onKeyPress={handleKeyPress}
          />

          <ProfileField
            label="Nombre de Usuario"
            value={user.nombreUsuario}
            field="nombreUsuario"
            icon={<AtSign size={20} />}
            isEditing={editingField === 'nombreUsuario'}
            tempValue={tempValue}
            onEditStart={handleEditStart}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onTempValueChange={handleTempValueChange}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {hasChanges && (
            <button
              className="cancel-changes-btn"
              onClick={handleCancelAllChanges}
              disabled={isLoading}
            >
              <X size={20} />
              Cancelar Cambios
            </button>
          )}

          <button
            className={`save-all-btn ${!hasChanges ? 'disabled' : ''}`}
            onClick={handleSaveAllChanges}
            disabled={!hasChanges || isLoading}
          >
            <Save size={20} />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};
