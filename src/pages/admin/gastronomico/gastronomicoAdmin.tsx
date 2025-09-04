import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import './gastronomicoAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import { BackToMenu } from '../../../components/BackToMenu';

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

// Componente memoizado para las imágenes
const GastronomicoImage = memo(
  ({ foto, nombreG }: { foto?: string; nombreG: string }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (foto) {
        const fullUrl = foto.startsWith('http')
          ? foto
          : `http://localhost:3000/uploads/gastronomicos/${foto}`;
        const urlWithTimestamp = `${fullUrl}?t=${Date.now()}`;
        setImageUrl(urlWithTimestamp);
        setImageError(false);
      } else {
        setImageUrl('/placeholder-image.svg');
      }
    }, [foto]);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageUrl('/placeholder-image.svg');
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
    montoG: '',
    zonaId: 0,
    foto: '',
    imagen: null as File | null,
  });

  const buildImageUrl = useCallback((fileName: string | undefined) => {
    if (!fileName) return '';
    if (fileName.startsWith('http')) return fileName;
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
        montoG: gastronomico.montoG.toString(),
        zonaId: gastronomico.zona.id,
        foto: gastronomico.foto,
        imagen: null as File | null,
      });
    } else {
      setFormData({
        nombreG: '',
        tipoComida: '',
        montoG: '',
        zonaId: 0,
        foto: '',
        imagen: null as File | null,
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
        [name]: name === 'zonaId' ? parseInt(value) : value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando datos del formulario:', formData);

    if (!formData.nombreG.trim()) {
      alert('El nombre del servicio gastronómico es requerido');
      return;
    }

    if (!formData.tipoComida) {
      alert('El tipo de comida es requerido');
      return;
    }

    const montoNumber = Number(formData.montoG);
    if (isNaN(montoNumber) || montoNumber <= 0) {
      alert('El monto debe ser un número mayor a 0');
      return;
    }

    if (formData.zonaId <= 0) {
      alert('Debe seleccionar una zona');
      return;
    }

    try {
      let response;

      if (editingGastronomico) {
        if (!formData.imagen) {
          const getFileName = (urlOrFileName: string) => {
            if (!urlOrFileName) return '';
            if (urlOrFileName.startsWith('http')) {
              return urlOrFileName.split('/').pop() || '';
            }
            return urlOrFileName;
          };

          const dataToSend = {
            nombreG: formData.nombreG.trim(),
            tipoComida: formData.tipoComida,
            montoG: Number(formData.montoG),
            zona: Number(formData.zonaId),
            ...(formData.foto.trim() && {
              foto: getFileName(formData.foto.trim()),
            }),
          };

          console.log('Editando sin nueva imagen:', dataToSend);
          response = await axios.put(
            `http://localhost:3000/api/gastronomico/${editingGastronomico.id}`,
            dataToSend,
            { withCredentials: true }
          );
        } else {
          const data = new FormData();
          data.append('nombreG', formData.nombreG.trim());
          data.append('tipoComida', formData.tipoComida);
          data.append('montoG', Number(formData.montoG).toString());
          data.append('zona', formData.zonaId.toString());
          data.append('imagen', formData.imagen);

          console.log('Editando con nueva imagen');
          response = await axios.put(
            `http://localhost:3000/api/gastronomico/${editingGastronomico.id}`,
            data,
            {
              withCredentials: true,
              headers: { 'Content-Type': 'multipart/form-data' },
            }
          );
        }
      } else {
        const data = new FormData();
        data.append('nombreG', formData.nombreG.trim());
        data.append('tipoComida', formData.tipoComida);
        data.append('montoG', Number(formData.montoG).toString());
        data.append('zona', formData.zonaId.toString());
        // Asegurar estado por defecto al crear
        data.append('estado', 'disponible');

        if (formData.imagen) {
          data.append('imagen', formData.imagen);
        }

        console.log('Creando nuevo gastronómico con FormData');
        response = await axios.post(
          'http://localhost:3000/api/gastronomico',
          data,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        console.log('Respuesta de creación:', response.data);
      }

      const listResponse = await axios.get(
        'http://localhost:3000/api/gastronomico',
        { withCredentials: true }
      );
      setGastronomicos(listResponse.data.data);
      closeModal();

      alert(
        editingGastronomico
          ? 'Servicio gastronómico actualizado exitosamente!'
          : 'Servicio gastronómico creado exitosamente!'
      );
    } catch (error: any) {
      console.error('Error al guardar Gastronómico:', error);
      console.error('Detalles del error:', error.response?.data);
      console.error('Estado del error:', error.response?.status);

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

        const response = await axios.get(
          'http://localhost:3000/api/gastronomico',
          { withCredentials: true }
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
      <BackToMenu className="admin-style" />
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
        <div className="edit-icon">+</div>
        <div className="gastronomico-info">
          <h3 className="gastronomico-name">Agregar Gastronómico</h3>
          <p className="gastronomico-tipoComida">
            Crear nuevo servicio gastronómico
          </p>
        </div>
      </div>

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

              <div className="form-group">
                <label htmlFor="imagen">Subir imagen (opcional):</label>
                <input
                  type="file"
                  id="imagen"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

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
                      alert('El archivo es demasiado grande. Máximo 5MB');
                      e.target.value = '';
                      return;
                    }

                    setFormData({ ...formData, imagen: file });
                  }}
                />
                <small style={{ color: '#999', fontSize: '12px' }}>
                  Formatos: JPEG, PNG, GIF, WebP. Máximo 5MB
                </small>
              </div>

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

              {formData.foto && !formData.imagen && (
                <div className="form-group">
                  <label>Imagen actual:</label>
                  <div style={{ marginTop: '8px' }}>
                    <img
                      key={formData.foto}
                      src={`${buildImageUrl(formData.foto)}?t=${Date.now()}`}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        display: 'block',
                      }}
                      onError={(e) => {
                        console.log(
                          '❌ Error cargando preview:',
                          buildImageUrl(formData.foto)
                        );
                        e.currentTarget.src = '/placeholder-image.svg';
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
