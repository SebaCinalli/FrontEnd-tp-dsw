import { useEffect, useState } from 'react';
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
  });

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

  const openModal = (barra: Barra | null = null) => {
    console.log('Abriendo modal:', barra ? 'editar' : 'crear');
    setEditingBarra(barra);
    if (barra) {
      const newFormData = {
        nombreB: barra.nombreB,
        tipoBebida: barra.tipoBebida,
        montoB: barra.montoB,
        zonaId: barra.zona.id,
        foto: barra.foto,
      };
      setFormData(newFormData);
    } else {
      const newFormData = {
        nombreB: '',
        tipoBebida: '',
        montoB: 0,
        zonaId: 0,
        foto: '',
      };
      setFormData(newFormData);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBarra(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === 'montoB' || name === 'zonaId' ? parseInt(value) || 0 : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

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
    
    if (!formData.foto.trim()) {
      alert('La URL de la foto es requerida');
      return;
    }
    
    // Preparar datos para envío - el backend espera 'zona' no 'zonaId'
    const dataToSend = {
      nombreB: formData.nombreB.trim(),
      tipoBebida: formData.tipoBebida,
      montoB: Number(formData.montoB),
      zona: Number(formData.zonaId), // El backend espera 'zona' no 'zonaId'
      foto: formData.foto.trim()
    };
    
    console.log('Datos preparados para envío:', dataToSend);
    
    try {
      let response;
      if (editingBarra) {
        // Editar Barra existente
        console.log('Editando barra existente con ID:', editingBarra.id);
        response = await axios.put(
          `http://localhost:3000/api/barra/${editingBarra.id}`,
          dataToSend,
          {
            withCredentials: true,
          }
        );
        console.log('Respuesta de edición:', response.data);
      } else {
        // Crear nueva Barra
        console.log('Creando nueva barra');
        response = await axios.post('http://localhost:3000/api/barra', dataToSend, {
          withCredentials: true,
        });
        console.log('Respuesta de creación:', response.data);
      }

      // Recargar la lista de Barras
      const listResponse = await axios.get('http://localhost:3000/api/barra', {
        withCredentials: true,
      });
      setBarras(listResponse.data.data);
      closeModal();
      
      // Mostrar mensaje de éxito
      alert(editingBarra ? 'Barra actualizada exitosamente!' : 'Barra creada exitosamente!');
    } catch (error: any) {
      console.error('Error al guardar Barra:', error);
      console.error('Detalles del error:', error.response?.data);
      console.error('Estado del error:', error.response?.status);
      
      // Mostrar mensaje de error más específico
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al ${editingBarra ? 'actualizar' : 'crear'} la barra: ${errorMessage}`);
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
          <img src={barra.foto} alt={barra.nombreB} className="barra-img" />
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
