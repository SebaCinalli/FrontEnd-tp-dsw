import { useEffect, useState } from 'react';
import axios from 'axios';
import './gastronomicoAdmin.css';
import { UserBadge } from '../../../components/userbadge';

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

  const openModal = (gastronomico: Gastronomico | null = null) => {
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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGastronomico(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'montoG' || name === 'zonaId' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos para envío - el backend espera 'zona' no 'zonaId'
    const dataToSend = {
      nombreG: formData.nombreG.trim(),
      tipoComida: formData.tipoComida,
      montoG: Number(formData.montoG),
      zona: Number(formData.zonaId), // El backend espera 'zona' no 'zonaId'
      foto: formData.foto.trim()
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
      alert(editingGastronomico ? 'Servicio gastronómico actualizado exitosamente!' : 'Servicio gastronómico creado exitosamente!');
    } catch (error: any) {
      console.error('Error al guardar Gastronómico:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al ${editingGastronomico ? 'actualizar' : 'crear'} el servicio gastronómico: ${errorMessage}`);
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
          <img
            src={gastronomico.foto}
            alt={gastronomico.nombreG}
            className="gastronomico-img"
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
