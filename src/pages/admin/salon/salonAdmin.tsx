import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import './salonAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import {
  uploadSalonImage,
  isValidImageFile,
  isValidFileSize,
} from '../../../utils/imageUpload';

interface Salon {
  id: number;
  nombre: string;
  capacidad: number;
  montoS: number;
  zona: {
    id: number;
    nombre: string;
  };
  foto: string;
  estado: string;
}

interface Zona {
  id: number;
  nombre: string;
}

// Componente memoizado para las imágenes para evitar re-renders innecesarios
const SalonImage = memo(
  ({ foto, nombre }: { foto?: string; nombre: string }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (foto) {
        // Construir URL completa si es necesario
        const fullUrl = foto.startsWith('http')
          ? foto
          : `http://localhost:3000/uploads/salones/${foto}`;

        // Agregar timestamp para cache busting si la imagen ya estaba cargada
        const urlWithTimestamp = `${fullUrl}?t=${Date.now()}`;
        setImageUrl(urlWithTimestamp);
        setImageError(false);
      } else {
        setImageUrl('https://via.placeholder.com/200x200?text=Sin+Imagen');
      }
    }, [foto]);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageUrl('https://via.placeholder.com/200x200?text=Error+Cargando');
    }, []);

    const handleImageLoad = useCallback(() => {
      setImageError(false);
    }, []);

    return (
      <img
        src={imageUrl}
        alt={nombre}
        className="salon-img"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          opacity: imageError ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />
    );
  }
);

SalonImage.displayName = 'SalonImage';

export function SalonAdmin() {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: 0,
    montoS: 0,
    zonaId: 0,
    foto: '',
    estado: 'disponible',
  });

  // Función helper para construir URLs de imagen (estable y memoizada)
  const buildImageUrl = useCallback((fileName: string | undefined) => {
    if (!fileName) return '';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `http://localhost:3000/uploads/salones/${fileName}`;
  }, []);

  useEffect(() => {
    const fetchSalones = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/salon', {
          withCredentials: true,
        });
        setSalones(response.data.data);
      } catch (error) {
        console.error('Error al cargar salones:', error);
      }
    };

    const fetchZonas = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/zona', {
          withCredentials: true,
        });
        setZonas(response.data.data);
      } catch (error) {
        console.error('Error al cargar zonas:', error);
      }
    };

    fetchSalones();
    fetchZonas();
  }, []);

  const openModal = useCallback((salon: Salon | null = null) => {
    setEditingSalon(salon);
    if (salon) {
      setFormData({
        nombre: salon.nombre,
        capacidad: salon.capacidad,
        montoS: salon.montoS,
        zonaId: salon.zona.id,
        foto: salon.foto,
        estado: salon.estado,
      });
    } else {
      setFormData({
        nombre: '',
        capacidad: 0,
        montoS: 0,
        zonaId: 0,
        foto: '',
        estado: 'disponible',
      });
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSalon(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === 'capacidad' || name === 'montoS' || name === 'zonaId'
            ? parseInt(value) || 0
            : value,
      }));
    },
    []
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Archivo seleccionado:', file.name, file.size, file.type);

    // Validaciones
    if (!isValidImageFile(file)) {
      alert(
        'Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF, WebP)'
      );
      return;
    }

    if (!isValidFileSize(file, 5)) {
      alert('El archivo es demasiado grande. Máximo 5MB permitido.');
      return;
    }

    // Solo subir si estamos editando un Salón existente
    if (!editingSalon?.id) {
      alert('Primero guarda el salón, luego podrás subir una imagen');
      return;
    }

    try {
      console.log('Iniciando subida de imagen para Salón ID:', editingSalon.id);
      const result = await uploadSalonImage(editingSalon.id, file);

      console.log('Resultado de subida:', result);

      if (result.success && result.imageUrl) {
        console.log('✅ URL de imagen recibida:', result.imageUrl);

        // Actualizar formData inmediatamente
        setFormData((prev) => ({
          ...prev,
          foto: result.imageUrl || '',
        }));

        // Actualizar la lista de Salones para reflejar la nueva imagen
        setSalones((prevSalones) =>
          prevSalones.map((salon) =>
            salon.id === editingSalon.id
              ? { ...salon, foto: result.imageUrl || '' }
              : salon
          )
        );

        alert('Imagen subida exitosamente!');
      } else {
        console.error('❌ Error en la subida:', result.message);
        alert('Error al subir imagen: ' + result.message);
      }
    } catch (error) {
      console.error('Error inesperado al subir imagen:', error);
      alert('Error inesperado al subir imagen');
    }

    // Limpiar el input para poder seleccionar el mismo archivo de nuevo si es necesario
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Función para extraer solo el nombre del archivo para el backend
    const getFileName = (urlOrFileName: string) => {
      if (!urlOrFileName) return '';
      // Si es una URL completa, extraer solo el nombre del archivo
      if (urlOrFileName.startsWith('http')) {
        return urlOrFileName.split('/').pop() || '';
      }
      // Si ya es solo el nombre del archivo, devolverlo tal como está
      return urlOrFileName;
    };

    // Preparar datos para envío - el backend espera 'zona' no 'zonaId'
    const dataToSend = {
      nombre: formData.nombre.trim(),
      capacidad: Number(formData.capacidad),
      montoS: Number(formData.montoS),
      zona: Number(formData.zonaId), // El backend espera 'zona' no 'zonaId'
      estado: formData.estado,
      ...(formData.foto.trim() && { foto: getFileName(formData.foto.trim()) }), // Solo el nombre del archivo
    };

    console.log('Datos a enviar:', dataToSend);

    try {
      if (editingSalon) {
        // Editar Salón existente
        await axios.put(
          `http://localhost:3000/api/salon/${editingSalon.id}`,
          dataToSend,
          {
            withCredentials: true,
          }
        );
      } else {
        // Crear nuevo Salón
        await axios.post('http://localhost:3000/api/salon', dataToSend, {
          withCredentials: true,
        });
      }

      // Recargar la lista de Salones
      const response = await axios.get('http://localhost:3000/api/salon', {
        withCredentials: true,
      });
      setSalones(response.data.data);
      closeModal();

      // Mostrar mensaje de éxito
      alert(
        editingSalon
          ? 'Salón actualizado exitosamente!'
          : 'Salón creado exitosamente!'
      );
    } catch (error: any) {
      console.error('Error al guardar Salón:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Error desconocido';
      alert(
        `Error al ${
          editingSalon ? 'actualizar' : 'crear'
        } el salón: ${errorMessage}`
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este salón?')) {
      try {
        await axios.delete(`http://localhost:3000/api/salon/${id}`, {
          withCredentials: true,
        });

        // Recargar la lista de Salones
        const response = await axios.get('http://localhost:3000/api/salon', {
          withCredentials: true,
        });
        setSalones(response.data.data);
      } catch (error) {
        console.error('Error al eliminar Salón:', error);
      }
    }
  };

  const handleEditClick = () => {
    openModal();
  };

  return (
    <div className="salon-container">
      <UserBadge />
      {salones.map((salon) => (
        <div className="salon-card" key={salon.id}>
          <SalonImage foto={salon.foto} nombre={salon.nombre} />
          <div className="salon-info">
            <h3 className="salon-name">{salon.nombre}</h3>
            <p className="salon-capacidad">
              Capacidad: {salon.capacidad} personas
            </p>
            <p className="salon-montoS">
              ${salon.montoS.toLocaleString('es-AR')}
            </p>
            <p className="salon-estado">Estado: {salon.estado}</p>
            <p className="salon-zona">{salon.zona.nombre}</p>
          </div>
          <div className="card-actions">
            <button className="edit-btn" onClick={() => openModal(salon)}>
              ✏️ Editar
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(salon.id)}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
      <div className="salon-card edit-card" onClick={handleEditClick}>
        <div className="edit-icon">✏️</div>
        <div className="salon-info">
          <h3 className="salon-name">Agregar Salón</h3>
          <p className="salon-capacidad">Crear nuevo salón</p>
        </div>
      </div>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSalon ? 'Editar Salón' : 'Agregar Salón'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Salón:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacidad">Capacidad (personas):</label>
                <input
                  type="number"
                  id="capacidad"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="montoS">Monto:</label>
                <input
                  type="number"
                  id="montoS"
                  name="montoS"
                  value={formData.montoS}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="zonaId">Zona:</label>
                <select
                  id="zonaId"
                  name="zonaId"
                  value={formData.zonaId}
                  onChange={handleInputChange}
                  required
                >
                  <option value={0}>Seleccionar zona</option>
                  {zonas.map((zona) => (
                    <option key={zona.id} value={zona.id}>
                      {zona.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado:</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Campo para subir archivo de imagen */}
              <div className="form-group">
                <label htmlFor="imagen">Subir imagen:</label>
                <input
                  type="file"
                  id="imagen"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                />
                <small style={{ color: '#999', fontSize: '12px' }}>
                  {editingSalon
                    ? 'Formatos: JPEG, PNG, GIF, WebP. Máximo 5MB'
                    : 'Primero guarda el salón para poder subir imagen'}
                </small>
              </div>

              {/* Preview de la imagen si existe */}
              {formData.foto && (
                <div className="form-group">
                  <label>Vista previa:</label>
                  <div style={{ marginTop: '8px' }}>
                    <img
                      key={formData.foto} // Forzar re-render cuando cambia la foto
                      src={`${buildImageUrl(formData.foto)}?t=${Date.now()}`} // Cache busting
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        display: 'block',
                      }}
                      onLoad={() =>
                        console.log(
                          '✅ Preview cargado correctamente:',
                          formData.foto
                        )
                      }
                      onError={(e) => {
                        console.log(
                          '❌ Error cargando preview:',
                          buildImageUrl(formData.foto)
                        );
                        // Imagen por defecto si falla
                        e.currentTarget.src =
                          'https://via.placeholder.com/200x200?text=Error+Cargando';
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      Archivo: {formData.foto}
                    </p>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  {editingSalon ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
