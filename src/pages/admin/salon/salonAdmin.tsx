import { useEffect, useState } from 'react';
import axios from 'axios';
import './salonAdmin.css';
import { UserBadge } from '../../../components/userbadge';

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
}

interface Zona {
  id: number;
  nombre: string;
}

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
  });

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

  const openModal = (salon: Salon | null = null) => {
    setEditingSalon(salon);
    if (salon) {
      setFormData({
        nombre: salon.nombre,
        capacidad: salon.capacidad,
        montoS: salon.montoS,
        zonaId: salon.zona.id,
        foto: salon.foto,
      });
    } else {
      setFormData({
        nombre: '',
        capacidad: 0,
        montoS: 0,
        zonaId: 0,
        foto: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSalon(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'capacidad' || name === 'montoS' || name === 'zonaId'
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSalon) {
        // Editar Salón existente
        await axios.put(
          `http://localhost:3000/api/salon/${editingSalon.id}`,
          formData,
          {
            withCredentials: true,
          }
        );
      } else {
        // Crear nuevo Salón
        await axios.post('http://localhost:3000/api/salon', formData, {
          withCredentials: true,
        });
      }

      // Recargar la lista de Salones
      const response = await axios.get('http://localhost:3000/api/salon', {
        withCredentials: true,
      });
      setSalones(response.data.data);
      closeModal();
    } catch (error) {
      console.error('Error al guardar Salón:', error);
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
          <img src={salon.foto} alt={salon.nombre} className="salon-img" />
          <div className="salon-info">
            <h3 className="salon-name">{salon.nombre}</h3>
            <p className="salon-capacidad">
              Capacidad: {salon.capacidad} personas
            </p>
            <p className="salon-montoS">
              ${salon.montoS.toLocaleString('es-AR')}
            </p>
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
                <label htmlFor="foto">URL de la foto:</label>
                <input
                  type="url"
                  id="foto"
                  name="foto"
                  value={formData.foto}
                  onChange={handleInputChange}
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
