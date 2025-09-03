import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './zonaAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import { BackToMenu } from '../../../components/BackToMenu';

interface Zona {
  id: number;
  nombre: string;
}

export function ZonaAdmin() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
  });

  useEffect(() => {
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

    fetchZonas();
  }, []);

  const openModal = useCallback((zona: Zona | null = null) => {
    setEditingZona(zona);
    if (zona) {
      setFormData({
        nombre: zona.nombre,
      });
    } else {
      setFormData({
        nombre: '',
      });
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingZona(null);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviando datos del formulario:', formData);

    // Validaciones previas
    if (!formData.nombre.trim()) {
      alert('El nombre de la zona es requerido');
      return;
    }

    try {
      let response;

      if (editingZona) {
        // Editar zona existente
        const dataToSend = {
          nombre: formData.nombre.trim(),
        };

        console.log('Editando zona:', dataToSend);
        response = await axios.put(
          `http://localhost:3000/api/zona/${editingZona.id}`,
          dataToSend,
          {
            withCredentials: true,
          }
        );
      } else {
        // Crear nueva zona
        const dataToSend = {
          nombre: formData.nombre.trim(),
        };

        console.log('Creando nueva zona:', dataToSend);
        response = await axios.post(
          'http://localhost:3000/api/zona',
          dataToSend,
          {
            withCredentials: true,
          }
        );

        console.log('Respuesta de creación:', response.data);
      }

      // Recargar la lista de zonas
      const listResponse = await axios.get('http://localhost:3000/api/zona', {
        withCredentials: true,
      });
      setZonas(listResponse.data.data);
      closeModal();

      // Mostrar mensaje de éxito
      alert(
        editingZona
          ? 'Zona actualizada exitosamente!'
          : 'Zona creada exitosamente!'
      );
    } catch (error: any) {
      console.error('Error al guardar zona:', error);
      console.error('Detalles del error:', error.response?.data);
      console.error('Estado del error:', error.response?.status);

      // Mostrar mensaje de error más específico
      const errorMessage =
        error.response?.data?.message || error.message || 'Error desconocido';
      alert(
        `Error al ${
          editingZona ? 'actualizar' : 'crear'
        } la zona: ${errorMessage}`
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta zona?')) {
      try {
        await axios.delete(`http://localhost:3000/api/zona/${id}`, {
          withCredentials: true,
        });

        // Recargar la lista de zonas
        const response = await axios.get('http://localhost:3000/api/zona', {
          withCredentials: true,
        });
        setZonas(response.data.data);

        alert('Zona eliminada exitosamente!');
      } catch (error: any) {
        console.error('Error al eliminar zona:', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Error desconocido';
        alert(`Error al eliminar la zona: ${errorMessage}`);
      }
    }
  };

  const handleEditClick = () => {
    openModal();
  };

  return (
    <div className="zona-container">
      <BackToMenu className="admin-style" />
      <UserBadge />
      {zonas.map((zona) => (
        <div className="zona-card" key={zona.id}>
          <div className="zona-icon">🏢</div>
          <div className="zona-info">
            <h3 className="zona-name">{zona.nombre}</h3>
            <p className="zona-id">ID: {zona.id}</p>
          </div>
          <div className="card-actions">
            <button className="edit-btn" onClick={() => openModal(zona)}>
              ✏️ Editar
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(zona.id)}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
      <div className="zona-card edit-card" onClick={handleEditClick}>
        <div className="edit-icon">✏️</div>
        <div className="zona-info">
          <h3 className="zona-name">Agregar Zona</h3>
          <p className="zona-description">Crear nueva zona</p>
        </div>
      </div>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingZona ? 'Editar Zona' : 'Agregar Zona'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre de la Zona:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Zona Norte, Zona Sur, etc."
                  required
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
                  {editingZona ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
