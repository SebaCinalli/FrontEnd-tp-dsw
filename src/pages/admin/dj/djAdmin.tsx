import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import './djAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import {
  uploadDjImage,
  isValidImageFile,
  isValidFileSize,
} from '../../../utils/imageUpload';

interface Dj {
  id: number;
  nombreArtistico: string;
  estado: string;
  montoDj: number;
  zona: {
    id: number;
    nombre: string;
  };
  foto?: string;
}

interface Zona {
  id: number;
  nombre: string;
}

// Componente memoizado para las imágenes para evitar re-renders innecesarios
const DjImage = memo(
  ({ foto, nombreArtistico }: { foto?: string; nombreArtistico: string }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (foto) {
        // Construir URL completa si es necesario
        const fullUrl = foto.startsWith('http')
          ? foto
          : `http://localhost:3000/uploads/djs/${foto}`;

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
        alt={nombreArtistico}
        className="dj-img"
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

DjImage.displayName = 'DjImage';

export function DjAdmin() {
  const [djs, setDjs] = useState<Dj[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDj, setEditingDj] = useState<Dj | null>(null);
  const [formData, setFormData] = useState({
    nombreArtistico: '',
    estado: '',
    montoDj: 0,
    zonaId: 0,
    foto: '',
  });

  // Función helper para construir URLs de imagen (estable y memoizada)
  const buildImageUrl = useCallback((fileName: string | undefined) => {
    if (!fileName) return '';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `http://localhost:3000/uploads/djs/${fileName}`;
  }, []);

  useEffect(() => {
    const fetchDjs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/dj', {
          withCredentials: true,
        });
        setDjs(response.data.data);
      } catch (error) {
        console.error('Error al cargar djs:', error);
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

    fetchDjs();
    fetchZonas();
  }, []);

  const openModal = useCallback((dj: Dj | null = null) => {
    setEditingDj(dj);
    if (dj) {
      setFormData({
        nombreArtistico: dj.nombreArtistico,
        estado: dj.estado,
        montoDj: dj.montoDj,
        zonaId: dj.zona.id,
        foto: dj.foto || '',
      });
    } else {
      setFormData({
        nombreArtistico: '',
        estado: '',
        montoDj: 0,
        zonaId: 0,
        foto: '',
      });
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingDj(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === 'montoDj' || name === 'zonaId' ? parseInt(value) : value,
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

    // Solo subir si estamos editando un DJ existente
    if (!editingDj?.id) {
      alert('Primero guarda el DJ, luego podrás subir una imagen');
      return;
    }

    try {
      console.log('Iniciando subida de imagen para DJ ID:', editingDj.id);
      const result = await uploadDjImage(editingDj.id, file);

      console.log('Resultado de subida:', result);

      if (result.success && result.imageUrl) {
        console.log('✅ URL de imagen recibida:', result.imageUrl);

        // Actualizar formData inmediatamente
        setFormData((prev) => ({
          ...prev,
          foto: result.imageUrl || '',
        }));

        // Actualizar la lista de DJs para reflejar la nueva imagen
        setDjs((prevDjs) =>
          prevDjs.map((dj) =>
            dj.id === editingDj.id ? { ...dj, foto: result.imageUrl || '' } : dj
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
      nombreArtistico: formData.nombreArtistico.trim(),
      estado: formData.estado,
      montoDj: Number(formData.montoDj),
      zona: Number(formData.zonaId), // El backend espera 'zona' no 'zonaId'
      ...(formData.foto.trim() && { foto: getFileName(formData.foto.trim()) }), // Solo el nombre del archivo
    };

    console.log('Datos a enviar:', dataToSend);

    try {
      if (editingDj) {
        // Editar DJ existente
        await axios.put(
          `http://localhost:3000/api/dj/${editingDj.id}`,
          dataToSend,
          {
            withCredentials: true,
          }
        );
      } else {
        // Crear nuevo DJ
        await axios.post('http://localhost:3000/api/dj', dataToSend, {
          withCredentials: true,
        });
      }

      // Recargar la lista de DJs
      const response = await axios.get('http://localhost:3000/api/dj', {
        withCredentials: true,
      });
      setDjs(response.data.data);
      closeModal();

      // Mostrar mensaje de éxito
      alert(
        editingDj ? 'DJ actualizado exitosamente!' : 'DJ creado exitosamente!'
      );
    } catch (error: any) {
      console.error('Error al guardar DJ:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Error desconocido';
      alert(
        `Error al ${editingDj ? 'actualizar' : 'crear'} el DJ: ${errorMessage}`
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este DJ?')) {
      try {
        await axios.delete(`http://localhost:3000/api/dj/${id}`, {
          withCredentials: true,
        });

        // Recargar la lista de DJs
        const response = await axios.get('http://localhost:3000/api/dj', {
          withCredentials: true,
        });
        setDjs(response.data.data);
      } catch (error) {
        console.error('Error al eliminar DJ:', error);
      }
    }
  };

  const handleEditClick = () => {
    openModal();
  };

  return (
    <div className="dj-container">
      <UserBadge />
      {djs.map((dj) => (
        <div className="dj-card" key={dj.id}>
          <DjImage foto={dj.foto} nombreArtistico={dj.nombreArtistico} />
          <div className="dj-info">
            <h3 className="dj-name">{dj.nombreArtistico}</h3>
            <p className="dj-estado">Estado: {dj.estado}</p>
            <p className="dj-montoS">${dj.montoDj.toLocaleString('es-AR')}</p>
            <p className="dj-zona">{dj.zona.nombre}</p>
          </div>
          <div className="card-actions">
            <button className="edit-btn" onClick={() => openModal(dj)}>
              ✏️ Editar
            </button>
            <button className="delete-btn" onClick={() => handleDelete(dj.id)}>
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
      <div className="dj-card edit-card" onClick={handleEditClick}>
        <div className="edit-icon">+</div>
        <div className="dj-info">
          <h3 className="dj-name">Agregar DJ</h3>
          <p className="dj-estado">Crear nuevo DJ</p>
        </div>
      </div>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingDj ? 'Editar DJ' : 'Agregar DJ'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombreArtistico">Nombre Artístico:</label>
                <input
                  type="text"
                  id="nombreArtistico"
                  name="nombreArtistico"
                  value={formData.nombreArtistico}
                  onChange={handleInputChange}
                  required
                />
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
                  <option value="">Seleccionar estado</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Ocupado">Ocupado</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="montoDj">Monto:</label>
                <input
                  type="number"
                  id="montoDj"
                  name="montoDj"
                  value={formData.montoDj}
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

              {/* Campo manual de imagen comentado - ahora solo se usa el uploader
              <div className="form-group">
                <label htmlFor="foto">Imagen (opcional):</label>
                <input
                  type="text"
                  id="foto"
                  name="foto"
                  value={formData.foto}
                  onChange={handleInputChange}
                  placeholder="Nombre del archivo o URL completa"
                />
              </div>
              */}

              {/* Campo para subir archivo de imagen */}
              <div className="form-group">
                <label htmlFor="imagen">O subir imagen:</label>
                <input
                  type="file"
                  id="imagen"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                />
                <small style={{ color: '#999', fontSize: '12px' }}>
                  {editingDj
                    ? 'Formatos: JPEG, PNG, GIF, WebP. Máximo 5MB'
                    : 'Primero guarda el DJ para poder subir imagen'}
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
                  {editingDj ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
