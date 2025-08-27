import { useEffect, useState } from 'react';
import axios from 'axios';
import './djAdmin.css';
import { UserBadge } from '../../../components/userbadge';

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

  const openModal = (dj: Dj | null = null) => {
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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDj(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'montoDj' || name === 'zonaId' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos para envío - el backend espera 'zona' no 'zonaId'
    const dataToSend = {
      nombreArtistico: formData.nombreArtistico.trim(),
      estado: formData.estado,
      montoDj: Number(formData.montoDj),
      zona: Number(formData.zonaId), // El backend espera 'zona' no 'zonaId'
      foto: formData.foto.trim()
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
      alert(editingDj ? 'DJ actualizado exitosamente!' : 'DJ creado exitosamente!');
    } catch (error: any) {
      console.error('Error al guardar DJ:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al ${editingDj ? 'actualizar' : 'crear'} el DJ: ${errorMessage}`);
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
          <img src={dj.foto} alt={dj.nombreArtistico} className="dj-img" />
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

              <div className="form-group">
                <label htmlFor="foto">URL de la foto:</label>
                <input
                  type="url"
                  id="foto"
                  name="foto"
                  value={formData.foto}
                  onChange={handleInputChange}
                />
              </div>

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
