import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import './salonAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import { BackToMenu } from '../../../components/BackToMenu';

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
    imagen: null as File | null,
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
        imagen: null as File | null,
      });
    } else {
      setFormData({
        nombre: '',
        capacidad: 0,
        montoS: 0,
        zonaId: 0,
        foto: '',
        estado: 'disponible',
        imagen: null as File | null,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando datos del formulario:', formData);

    // Validaciones previas
    if (!formData.nombre.trim()) {
      alert('El nombre del salón es requerido');
      return;
    }

    if (formData.capacidad <= 0) {
      alert('La capacidad debe ser mayor a 0');
      return;
    }

    if (formData.montoS <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    if (formData.zonaId <= 0) {
      alert('Debe seleccionar una zona');
      return;
    }

    try {
      let response;

      if (editingSalon) {
        // Para editar, usar el método anterior (JSON) si no hay nueva imagen
        if (!formData.imagen) {
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

          const dataToSend = {
            nombre: formData.nombre.trim(),
            capacidad: Number(formData.capacidad),
            montoS: Number(formData.montoS),
            zona: Number(formData.zonaId),
            estado: formData.estado,
            ...(formData.foto.trim() && {
              foto: getFileName(formData.foto.trim()),
            }),
          };

          console.log('Editando sin nueva imagen:', dataToSend);
          response = await axios.put(
            `http://localhost:3000/api/salon/${editingSalon.id}`,
            dataToSend,
            {
              withCredentials: true,
            }
          );
        } else {
          // Si hay nueva imagen, usar FormData
          const data = new FormData();
          data.append('nombre', formData.nombre.trim());
          data.append('capacidad', formData.capacidad.toString());
          data.append('montoS', formData.montoS.toString());
          data.append('zona', formData.zonaId.toString());
          data.append('estado', formData.estado);
          data.append('imagen', formData.imagen);

          console.log('Editando con nueva imagen');
          response = await axios.put(
            `http://localhost:3000/api/salon/${editingSalon.id}`,
            data,
            {
              withCredentials: true,
            }
          );
        }
      } else {
        // Para crear nuevo salón, usar FormData
        const data = new FormData();
        data.append('nombre', formData.nombre.trim());
        data.append('capacidad', formData.capacidad.toString());
        data.append('montoS', formData.montoS.toString());
        data.append('zona', formData.zonaId.toString());
        data.append('estado', formData.estado);

        // Importante: el nombre del campo debe ser 'imagen' (según el middleware)
        if (formData.imagen) {
          data.append('imagen', formData.imagen);
        }

        console.log('Creando nuevo salón con FormData');
        response = await axios.post(
          'http://localhost:3000/api/salon',
          data,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        console.log('Respuesta de creación:', response.data);
      }

      // Recargar la lista de Salones
      const listResponse = await axios.get('http://localhost:3000/api/salon', {
        withCredentials: true,
      });
      setSalones(listResponse.data.data);
      closeModal();

      // Mostrar mensaje de éxito
      alert(
        editingSalon
          ? 'Salón actualizado exitosamente!'
          : 'Salón creado exitosamente!'
      );
    } catch (error: any) {
      console.error('Error al guardar Salón:', error);
      console.error('Detalles del error:', error.response?.data);
      console.error('Estado del error:', error.response?.status);

      // Mostrar mensaje de error más específico
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
      <BackToMenu className="admin-style" />
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
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validaciones básicas
                    const validTypes = [
                      'image/jpeg',
                      'image/png',
                      'image/gif',
                      'image/webp',
                    ];
                    if (!validTypes.includes(file.type)) {
                      alert(
                        'Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF, WebP)'
                      );
                      e.target.value = '';
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      // 5MB
                      alert(
                        'El archivo es demasiado grande. Máximo 5MB permitido.'
                      );
                      e.target.value = '';
                      return;
                    }

                    setFormData({
                      ...formData,
                      imagen: file,
                    });
                  }}
                />
                <small style={{ color: '#999', fontSize: '12px' }}>
                  Formatos: JPEG, PNG, GIF, WebP. Máximo 5MB
                </small>
              </div>

              {/* Preview de la nueva imagen seleccionada */}
              {formData.imagen && (
                <div className="form-group">
                  <label>Nueva imagen seleccionada:</label>
                  <div style={{ marginTop: '8px' }}>
                    <img
                      src={URL.createObjectURL(formData.imagen)}
                      alt="Nueva imagen"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        display: 'block',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      Archivo: {formData.imagen.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Preview de la imagen si existe */}
              {formData.foto && !formData.imagen && (
                <div className="form-group">
                  <label>Imagen actual:</label>
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
