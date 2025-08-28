import { useEffect, useState } from 'react';
import axios from 'axios';
import './dj.css';
import { UserBadge } from '../../components/userbadge';

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

interface FilterState {
  zona: string;
  estado: string;
  precioMin: string;
  precioMax: string;
}

export function Dj() {
  const [djs, setDjs] = useState<Dj[]>([]);
  const [djsFiltrados, setDjsFiltrados] = useState<Dj[]>([]);
  const [filtros, setFiltros] = useState<FilterState>({
    zona: '',
    estado: '',
    precioMin: '',
    precioMax: '',
  });
  const [zonas, setZonas] = useState<string[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Función helper para construir URLs de imagen
  const buildImageUrl = (fileName: string | undefined) => {
    if (!fileName) return '/placeholder-image.svg';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `http://localhost:3000/uploads/djs/${fileName}`;
  };

  useEffect(() => {
    const fetchDjs = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/dj', {
          withCredentials: true,
        });
        const data = response.data.data;
        setDjs(data);
        setDjsFiltrados(data);

        // Extraer estados únicos
        const estadosUnicos = [
          ...new Set(data.map((dj: Dj) => dj.estado)),
        ] as string[];
        setEstados(estadosUnicos);
      } catch (error) {
        console.error('Error al cargar djs:', error);
      }
    };

    const fetchZonas = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/zona', {
          withCredentials: true,
        });
        const data = response.data.data;
        // Extraer todas las zonas disponibles del sistema
        const todasLasZonas = data.map((zona: any) => zona.nombre);
        setZonas(todasLasZonas);
      } catch (error) {
        console.error('Error al cargar zonas:', error);
      }
    };

    fetchDjs();
    fetchZonas();
  }, []);

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultado = [...djs];

    if (filtros.zona) {
      resultado = resultado.filter((dj) => dj.zona.nombre === filtros.zona);
    }

    if (filtros.estado) {
      resultado = resultado.filter((dj) => dj.estado === filtros.estado);
    }

    if (filtros.precioMin) {
      resultado = resultado.filter(
        (dj) => dj.montoDj >= parseInt(filtros.precioMin)
      );
    }

    if (filtros.precioMax) {
      resultado = resultado.filter(
        (dj) => dj.montoDj <= parseInt(filtros.precioMax)
      );
    }

    setDjsFiltrados(resultado);
  }, [filtros, djs]);

  const handleFiltroChange = (campo: keyof FilterState, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      zona: '',
      estado: '',
      precioMin: '',
      precioMax: '',
    });
  };

  return (
    <div className="dj-container">
      <UserBadge />

      {/* Panel de filtros */}
      <div className={`filtros-panel ${filtrosAbiertos ? 'abierto' : ''}`}>
        <div className="filtros-header">
          <h3>Filtros</h3>
          <button
            className="filtros-toggle"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            aria-label="Toggle filtros"
          >
            <span
              className={`filtros-arrow ${filtrosAbiertos ? 'rotated' : ''}`}
            >
              ▼
            </span>
          </button>
        </div>
        <div
          className={`filtros-content ${
            filtrosAbiertos ? 'visible' : 'hidden'
          }`}
        >
          <div className="filtros-grid">
            <div className="filtro-item">
              <label htmlFor="zona-filter">Zona:</label>
              <select
                id="zona-filter"
                value={filtros.zona}
                onChange={(e) => handleFiltroChange('zona', e.target.value)}
              >
                <option value="">Todas las zonas</option>
                {zonas.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="estado-filter">Estado:</label>
              <select
                id="estado-filter"
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="precio-min">Precio mínimo:</label>
              <input
                type="number"
                id="precio-min"
                value={filtros.precioMin}
                onChange={(e) =>
                  handleFiltroChange('precioMin', e.target.value)
                }
                placeholder="0"
              />
            </div>

            <div className="filtro-item">
              <label htmlFor="precio-max">Precio máximo:</label>
              <input
                type="number"
                id="precio-max"
                value={filtros.precioMax}
                onChange={(e) =>
                  handleFiltroChange('precioMax', e.target.value)
                }
                placeholder="Sin límite"
              />
            </div>

            <div className="filtro-item">
              <button onClick={limpiarFiltros} className="limpiar-filtros-btn">
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados - se muestra después de los filtros */}
      <div className="resultados-count">
        {djsFiltrados.length} resultado(s) encontrado(s)
      </div>

      <div className="djs-grid">
        {djsFiltrados.map((dj) => (
          <div className="dj-card" key={dj.id}>
            <div className="dj-img-container">
              <img
                src={buildImageUrl(dj.foto)}
                alt={dj.nombreArtistico}
                className="dj-img"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            </div>
            <div className="dj-info">
              <h3 className="dj-name">{dj.nombreArtistico}</h3>
              <p className="dj-estado">Estado: {dj.estado}</p>
              <p className="dj-montoS">${dj.montoDj.toLocaleString('es-AR')}</p>
              <p className="dj-zona">{dj.zona.nombre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
