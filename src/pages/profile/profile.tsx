import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  AtSign,
  ArrowLeft,
  Save,
  X,
  Camera,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/usercontext';
import { useAlert } from '../../context/alertcontext';
import './profile.css';
import { ProfileField } from './profilefield';
import {
  uploadUsuarioImage,
  isValidImageFile,
  isValidFileSize,
} from '../../utils/imageUpload';

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
  const { user: contextUser, login, logout } = useUser();
  const { showAlert } = useAlert();
  // Estado para controlar el modal de confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Manejar eliminación de usuario
  const handleDeleteUser = useCallback(async () => {
    if (!contextUser) return;
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/usuario/${contextUser.id}`,
        { withCredentials: true }
      );
      if (response.status === 200) {
        await logout();
        showAlert('Usuario eliminado correctamente.', 'success');
        navigate('/login');
      } else {
        showAlert('No se pudo eliminar el usuario.', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      showAlert('Error al eliminar el usuario.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [contextUser, logout, navigate]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [imageError, setImageError] = useState(false);

  // Cargar datos del usuario del contexto
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

  // Resetear el error de imagen cuando cambia la URL de la imagen
  useEffect(() => {
    if (user.img && user.img.trim() !== '') {
      setImageError(false);
    }
  }, [user.img]);

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
        showAlert('Perfil actualizado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      showAlert('Error al actualizar el perfil. Por favor, intenta nuevamente.', 'error');
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

  // Funciones para manejar la carga de imágenes
  const handleImageUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !contextUser) return;

      // Validar tipo de archivo
      if (!isValidImageFile(file)) {
        showAlert(
          'Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF, WebP)',
          'warning'
        );
        return;
      }

      // Validar tamaño de archivo (máximo 5MB)
      if (!isValidFileSize(file, 5)) {
        showAlert(
          'La imagen es demasiado grande. El tamaño máximo permitido es 5MB',
          'warning'
        );
        return;
      }

      setIsUploadingImage(true);

      try {
        const result = await uploadUsuarioImage(contextUser.id, file);

        if (result.success) {
          if (result.imageUrl && result.imageUrl.trim() !== '') {
            console.log('Nueva imagen cargada, URL:', result.imageUrl);

            // Actualizar el estado local
            const updatedUser = { ...user, img: result.imageUrl };
            setUser(updatedUser);

            // Actualizar el contexto de usuario
            const updatedContextUser = { ...contextUser, img: result.imageUrl };
            login(updatedContextUser);

            // Resetear el error de imagen explícitamente
            setImageError(false);

            showAlert('Imagen cargada exitosamente', 'success');
          } else {
            // La subida fue exitosa pero no se obtuvo la URL de la imagen
            console.warn('Subida exitosa pero sin URL de imagen:', result);
            showAlert(
              'Imagen subida exitosamente, pero hubo un problema al obtener la URL. Actualiza la página para ver los cambios.',
              'warning'
            );
          }
        } else {
          throw new Error(result.message || 'Error al cargar la imagen');
        }
      } catch (error: any) {
        console.error('Error al cargar imagen:', error);
        showAlert(
          error.message ||
            'Error al cargar la imagen. Por favor, intenta nuevamente.',
          'error'
        );
      } finally {
        setIsUploadingImage(false);
        // Limpiar el input de archivo
        if (event.target) {
          event.target.value = '';
        }
      }
    },
    [contextUser, user, login]
  );

  // Verificar si tiene imagen válida (igual que en UserBadge)
  const hasValidImage = user.img && user.img.trim() !== '' && !imageError;

  // Función para manejar el error de carga de imagen
  const handleImageError = () => {
    console.error('Error al cargar imagen:', user.img);
    setImageError(true);
  };

  // Función para manejar cuando la imagen se carga correctamente
  const handleImageLoad = () => {
    console.log('Imagen cargada correctamente:', user.img);
    if (imageError) {
      setImageError(false);
    }
  };

  // Debug: Log para verificar el estado de la imagen
  useEffect(() => {
    console.log(
      'Estado de imagen - URL:',
      user.img,
      'Error:',
      imageError,
      'HasValidImage:',
      hasValidImage
    );
  }, [user.img, imageError, hasValidImage]);

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
                    onError={handleImageError}
                    onLoad={handleImageLoad}
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
                {isUploadingImage && (
                  <div className="profile-image-loading">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
              <button
                className="profile-image-edit-btn"
                onClick={handleImageUploadClick}
                disabled={isUploadingImage}
                title="Cambiar foto de perfil"
              >
                {isUploadingImage ? <Upload size={16} /> : <Camera size={16} />}
              </button>
            </div>

            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

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

          {/* Botón eliminar usuario solo si NO es admin */}
          {contextUser?.rol !== 'administrador' && (
            <button
              className="delete-user-btn"
              style={{ marginLeft: 16 }}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}
            </button>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="delete-confirm-modal">
            <div className="delete-confirm-content">
              <h3>¿Estás seguro que deseas eliminar tu cuenta?</h3>
              <p>Esta acción es irreversible. Todos tus datos se perderán.</p>
              <div className="delete-confirm-actions">
                <button
                  className="delete-confirm-btn"
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                >
                  Sí, eliminar
                </button>
                <button
                  className="delete-cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
