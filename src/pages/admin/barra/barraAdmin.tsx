import { useEffect, useState, useCallback, memo } from 'react';
import axios from 'axios';
import './barraAdmin.css';
import { UserBadge } from '../../../components/userbadge';

interface Barra {
  id: number;
  nombreB: string;
  tipoBebida: string;
  montoB: number;
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
const BarraImage = memo(
  ({ foto, nombreB }: { foto?: string; nombreB: string }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      if (foto) {
        // Construir URL completa si es necesario
        const fullUrl = foto.startsWith('http')
          ? foto
          : `http://localhost:3000/uploads/barras/${foto}`;

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
        alt={nombreB}
        className="barra-img"
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

BarraImage.displayName = 'BarraImage';

export function BarraAdmin() {
  const [barras, setBarras] = useState<Barra[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarra, setEditingBarra] = useState<Barra | null>(null);
  const [formData, setFormData] = useState({
    nombreB: '',
    tipoBebida: '',
    montoB: 0,
    zonaId: 0,
    foto: '',
    imagen: null as File | null,
  });

  // Función helper para construir URLs de imagen (estable y memoizada)
  const buildImageUrl = useCallback((fileName: string | undefined) => {
    if (!fileName) return '';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `http://localhost:3000/uploads/barras/${fileName}`;
  }, []);

  useEffect(() => {
    const fetchBarras = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/barra', {
          withCredentials: true,
        });
        setBarras(response.data.data);
      } catch (error: any) {
        console.error('Error al cargar barras:', error);
        if (error.response?.status === 401) {
          alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
        }
      }
    };

    const fetchZonas = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/zona', {
          withCredentials: true,
        });
        setZonas(response.data.data);
      } catch (error: any) {
        console.error('Error al cargar zonas:', error);
      }
    };

    fetchBarras();
    fetchZonas();
  }, []);

  const openModal = useCallback((barra: Barra | null = null) => {
    console.log('Abriendo modal:', barra ? 'editar' : 'crear');
    setEditingBarra(barra);
    if (barra) {
      const newFormData = {
        nombreB: barra.nombreB,
        tipoBebida: barra.tipoBebida,
        montoB: barra.montoB,
        zonaId: barra.zona.id,
        foto: barra.foto,
        imagen: null as File | null,
      };
      setFormData(newFormData);
    } else {
      const newFormData = {
        nombreB: '',
        tipoBebida: '',
        montoB: 0,
        zonaId: 0,
        foto: '',
        imagen: null as File | null,
      };
      setFormData(newFormData);
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingBarra(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const newValue =
        name === 'montoB' || name === 'zonaId' ? parseInt(value) || 0 : value;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando datos del formulario:', formData);

    // Validaciones previas
    if (!formData.nombreB.trim()) {
      alert('El nombre de la barra es requerido');
      return;
    }

    if (!formData.tipoBebida) {
      alert('El tipo de bebida es requerido');
      return;
    }

    if (formData.montoB <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    if (formData.zonaId <= 0) {
      alert('Debe seleccionar una zona');
      return;
    }

    try {
      let response;

      if (editingBarra) {
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
            nombreB: formData.nombreB.trim(),
            tipoBebida: formData.tipoBebida,
            montoB: Number(formData.montoB),
            zona: Number(formData.zonaId),
            ...(formData.foto.trim() && {
              foto: getFileName(formData.foto.trim()),
            }),
          };

          console.log('Editando sin nueva imagen:', dataToSend);
          response = await axios.put(
            `http://localhost:3000/api/barra/${editingBarra.id}`,
            dataToSend,
            {
              withCredentials: true,
            }
          );
        } else {
          // Si hay nueva imagen, usar FormData
          const data = new FormData();
          data.append('nombreB', formData.nombreB.trim());
          data.append('tipoBebida', formData.tipoBebida);
          data.append('montoB', formData.montoB.toString());
          data.append('zona', formData.zonaId.toString());
          data.append('imagen', formData.imagen);

          console.log('Editando con nueva imagen');
          response = await axios.put(
            `http://localhost:3000/api/barra/${editingBarra.id}`,
            data,
            {
              withCredentials: true,
            }
          );
        }
      } else {
        // Para crear nueva barra, usar FormData
        const data = new FormData();
        data.append('nombreB', formData.nombreB.trim());
        data.append('tipoBebida', formData.tipoBebida);
        data.append('montoB', formData.montoB.toString());
        data.append('zona', formData.zonaId.toString());

        // Importante: el nombre del campo debe ser 'imagen' (según el middleware)
        if (formData.imagen) {
          data.append('imagen', formData.imagen);
        }

        console.log('Creando nueva barra con FormData');
        response = await fetch('http://localhost:3000/api/barra', {
          method: 'POST',
          credentials: 'include',
          body: data,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Respuesta de creación:', result);
      }

      // Recargar la lista de Barras
      const listResponse = await axios.get('http://localhost:3000/api/barra', {
        withCredentials: true,
      });
      setBarras(listResponse.data.data);
      closeModal();

      // Mostrar mensaje de éxito
      alert(
        editingBarra
          ? 'Barra actualizada exitosamente!'
          : 'Barra creada exitosamente!'
      );
    } catch (error: any) {
      console.error('Error al guardar Barra:', error);
      console.error('Detalles del error:', error.response?.data);
      console.error('Estado del error:', error.response?.status);

      // Mostrar mensaje de error más específico
      const errorMessage =
        error.response?.data?.message || error.message || 'Error desconocido';
      alert(
        `Error al ${
          editingBarra ? 'actualizar' : 'crear'
        } la barra: ${errorMessage}`
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta barra?')) {
      try {
        await axios.delete(`http://localhost:3000/api/barra/${id}`, {
          withCredentials: true,
        });

        // Recargar la lista de Barras
        const response = await axios.get('http://localhost:3000/api/barra', {
          withCredentials: true,
        });
        setBarras(response.data.data);
      } catch (error) {
        console.error('Error al eliminar Barra:', error);
      }
    }
  };

  const handleEditClick = () => {
    console.log('Abriendo modal para crear nueva barra');
    openModal();
  };

  return (
    <div className="barra-container">
      <UserBadge />
      {barras.map((barra) => (
        <div className="barra-card" key={barra.id}>
          <BarraImage foto={barra.foto} nombreB={barra.nombreB} />
          <div className="barra-info">
            <h3 className="barra-name">{barra.nombreB}</h3>
            <p className="barra-bebida">Tipo Bebida: {barra.tipoBebida}</p>
            <p className="barra-montoB">
              ${barra.montoB.toLocaleString('es-AR')}
            </p>
            <p className="barra-zona">{barra.zona.nombre}</p>
          </div>
          <div className="card-actions">
            <button className="edit-btn" onClick={() => openModal(barra)}>
              ✏️ Editar
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(barra.id)}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
      <div className="barra-card edit-card" onClick={handleEditClick}>
        <div className="edit-icon">✏️</div>
        <div className="barra-info">
          <h3 className="barra-name">Agregar Barra</h3>
          <p className="barra-bebida">Crear nueva barra</p>
        </div>
      </div>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingBarra ? 'Editar Barra' : 'Agregar Barra'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombreB">Nombre de la Barra:</label>
                <input
                  type="text"
                  id="nombreB"
                  name="nombreB"
                  value={formData.nombreB}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipoBebida">Tipo de Bebida:</label>
                <select
                  id="tipoBebida"
                  name="tipoBebida"
                  value={formData.tipoBebida}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Alcoholicas">Alcohólicas</option>
                  <option value="No Alcoholicas">No Alcohólicas</option>
                  <option value="Mixtas">Mixtas</option>
                  <option value="Cocteles">Cocteles</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="montoB">Monto:</label>
                <input
                  type="number"
                  id="montoB"
                  name="montoB"
                  value={formData.montoB}
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
                  {editingBarra ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
