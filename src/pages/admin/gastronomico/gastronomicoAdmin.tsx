import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import './gastronomicoAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import {
  uploadGastronomicoImage,
  isValidImageFile,
  isValidFileSize,
} from '../../../utils/imageUpload';

interface Gastronomico {
  id: number;
  nombreG: string;
  tipoComida: string;
  montoG: number;
  zona: {
    id: number;
    nombre: string;
  };
  foto: string;
}

interface Zona {
  id: number;
  nombre: string;
}

// Componente memoizado para las imágenes para evitar re-renders innecesarios
const GastronomicoImage = memo(
  ({ foto, nombreG }: { foto?: string; nombreG: string }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (foto) {
        // Construir URL completa si es necesario
        const fullUrl = foto.startsWith('http')
          ? foto
          : `http://localhost:3000/uploads/gastronomicos/${foto}`;

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
        alt={nombreG}
        className="gastronomico-img"
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

GastronomicoImage.displayName = 'GastronomicoImage';

export function GastronomicoAdmin() {
  const [gastronomicos, setGastronomicos] = useState<Gastronomico[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGastronomico, setEditingGastronomico] =
    useState<Gastronomico | null>(null);
  const [formData, setFormData] = useState({
    nombreG: '',
    tipoComida: '',
    montoG: 0,
    zonaId: 0,
    foto: '',
  });

  // Función helper para construir URLs de imagen (estable y memoizada)
  const buildImageUrl = useCallback((fileName: string | undefined) => {
    if (!fileName) return '';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `http://localhost:3000/uploads/gastronomicos/${fileName}`;
  }, []);

  useEffect(() => {
    const fetchGastronomicos = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3000/api/gastronomico',
          { withCredentials: true }
        );
        setGastronomicos(response.data.data);
      } catch (error) {
        console.error('Error al cargar gastronomicos:', error);
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

    fetchGastronomicos();
    fetchZonas();
  }, []);

  const openModal = useCallback((gastronomico: Gastronomico | null = null) => {
    setEditingGastronomico(gastronomico);
    if (gastronomico) {
      setFormData({
        nombreG: gastronomico.nombreG,
        tipoComida: gastronomico.tipoComida,
        montoG: gastronomico.montoG,
        zonaId: gastronomico.zona.id,
        foto: gastronomico.foto,
      });
    } else {
      setFormData({
        nombreG: '',
        tipoComida: '',
        montoG: 0,
        zonaId: 0,
        foto: '',
      });
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingGastronomico(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === 'montoG' || name === 'zonaId' ? parseInt(value) : value,
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

    // Solo subir si estamos editando un Gastronómico existente
    if (!editingGastronomico?.id) {
      alert(
        'Primero guarda el servicio gastronómico, luego podrás subir una imagen'
      );
      return;
    }

    try {
      console.log(
        'Iniciando subida de imagen para Gastronómico ID:',
        editingGastronomico.id
      );
      const result = await uploadGastronomicoImage(
        editingGastronomico.id,
        file
      );

      console.log('Resultado de subida:', result);

      if (result.success && result.imageUrl) {
        console.log('✅ URL de imagen recibida:', result.imageUrl);

        // Actualizar formData inmediatamente
        setFormData((prev) => ({
          ...prev,
          foto: result.imageUrl || '',
        }));

        // Actualizar la lista de Gastronómicos para reflejar la nueva imagen
        setGastronomicos((prevGastronomicos) =>
          prevGastronomicos.map((gastronomico) =>
            gastronomico.id === editingGastronomico.id
              ? { ...gastronomico, foto: result.imageUrl || '' }
              : gastronomico
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
      nombreG: formData.nombreG.trim(),
      tipoComida: formData.tipoComida,
      montoG: Number(formData.montoG),
      zona: Number(formData.zonaId), // El backend espera 'zona' no 'zonaId'
      ...(formData.foto.trim() && { foto: getFileName(formData.foto.trim()) }), // Solo el nombre del archivo
    };

    console.log('Datos a enviar:', dataToSend);

    try {
      if (editingGastronomico) {
        // Editar Gastronómico existente
        await axios.put(
          `http://localhost:3000/api/gastronomico/${editingGastronomico.id}`,
          dataToSend,
          {
            withCredentials: true,
          }
        );
      } else {
        // Crear nuevo Gastronómico
        await axios.post('http://localhost:3000/api/gastronomico', dataToSend, {
          withCredentials: true,
        });
      }

      // Recargar la lista de Gastronómicos
      const response = await axios.get(
        'http://localhost:3000/api/gastronomico',
        {
          withCredentials: true,
        }
      );
      setGastronomicos(response.data.data);
      closeModal();

      // Mostrar mensaje de éxito
      alert(
        editingGastronomico
          ? 'Servicio gastronómico actualizado exitosamente!'
          : 'Servicio gastronómico creado exitosamente!'
      );
    } catch (error: any) {
      console.error('Error al guardar Gastronómico:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Error desconocido';
      alert(
        `Error al ${
          editingGastronomico ? 'actualizar' : 'crear'
        } el servicio gastronómico: ${errorMessage}`
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar este servicio gastronómico?'
      )
    ) {
      try {
        await axios.delete(`http://localhost:3000/api/gastronomico/${id}`, {
          withCredentials: true,
        });

        // Recargar la lista de Gastronómicos
        const response = await axios.get(
          'http://localhost:3000/api/gastronomico',
          {
            withCredentials: true,
          }
        );
        setGastronomicos(response.data.data);
      } catch (error) {
        console.error('Error al eliminar Gastronómico:', error);
      }
    }
  };

  const handleEditClick = () => {
    openModal();
  };

  return (
    <div className="gastronomico-container">
      <UserBadge />
      {gastronomicos.map((gastronomico) => (
        <div className="gastronomico-card" key={gastronomico.id}>
          <GastronomicoImage
            foto={gastronomico.foto}
            nombreG={gastronomico.nombreG}
          />
          <div className="gastronomico-info">
            <h3 className="gastronomico-name">{gastronomico.nombreG}</h3>
            <p className="gastronomico-tipoComida">
              Tipo de comida: {gastronomico.tipoComida}
            </p>
            <p className="gastronomico-montoS">
              ${gastronomico.montoG.toLocaleString('es-AR')}
            </p>
            <p className="gastronomico-zona">{gastronomico.zona.nombre}</p>
          </div>
          <div className="card-actions">
            <button
              className="edit-btn"
              onClick={() => openModal(gastronomico)}
            >
              ✏️ Editar
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(gastronomico.id)}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
      <div className="gastronomico-card edit-card" onClick={handleEditClick}>
        <div className="edit-icon">✏️</div>
        <div className="gastronomico-info">
          <h3 className="gastronomico-name">Agregar Gastronómico</h3>
          <p className="gastronomico-tipoComida">
            Crear nuevo servicio gastronómico
          </p>
        </div>
      </div>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              {editingGastronomico
                ? 'Editar Gastronómico'
                : 'Agregar Gastronómico'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombreG">Nombre del Servicio:</label>
                <input
                  type="text"
                  id="nombreG"
                  name="nombreG"
                  value={formData.nombreG}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipoComida">Tipo de Comida:</label>
                <select
                  id="tipoComida"
                  name="tipoComida"
                  value={formData.tipoComida}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Italiana">Italiana</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Internacional">Internacional</option>
                  <option value="Vegetariana">Vegetariana</option>
                  <option value="Mariscos">Mariscos</option>
                  <option value="Parrilla">Parrilla</option>
                  <option value="Fast Food">Fast Food</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="montoG">Monto:</label>
                <input
                  type="number"
                  id="montoG"
                  name="montoG"
                  value={formData.montoG}
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
                  {editingGastronomico
                    ? 'Formatos: JPEG, PNG, GIF, WebP. Máximo 5MB'
                    : 'Primero guarda el servicio gastronómico para poder subir imagen'}
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
                  {editingGastronomico ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
