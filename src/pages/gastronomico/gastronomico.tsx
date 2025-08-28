import { useEffect, useState } from 'react';
import axios from 'axios';
import './gastronomico.css';
import { UserBadge } from '../../components/userbadge';

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

interface FilterState {
  zona: string;
  tipoComida: string;
  precioMin: string;
  precioMax: string;
}

export function Gastronomico() {
  const [gastronomicos, setGastronomicos] = useState<Gastronomico[]>([]);
  const [gastronomicosFiltrados, setGastronomicosFiltrados] = useState<
    Gastronomico[]
  >([]);
  const [filtros, setFiltros] = useState<FilterState>({
    zona: '',
    tipoComida: '',
    precioMin: '',
    precioMax: '',
  });
  const [zonas, setZonas] = useState<string[]>([]);
  const [tiposComida, setTiposComida] = useState<string[]>([]);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Función helper para construir URLs de imagen
  const buildImageUrl = (fileName: string | undefined) => {
    if (!fileName) return '/placeholder-image.svg';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `http://localhost:3000/uploads/gastronomicos/${fileName}`;
  };

  useEffect(() => {
    const fetchGastronomicos = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3000/api/gastronomico',
          { withCredentials: true }
        );
        const data = response.data.data;
        setGastronomicos(data);
        setGastronomicosFiltrados(data);

        // Extraer tipos de comida únicos
        const tiposUnicos = [
          ...new Set(
            data.map((gastronomico: Gastronomico) => gastronomico.tipoComida)
          ),
        ] as string[];
        setTiposComida(tiposUnicos);
      } catch (error) {
        console.error('Error al cargar gastronomicos:', error);
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

    fetchGastronomicos();
    fetchZonas();
  }, []);

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultado = [...gastronomicos];

    if (filtros.zona) {
      resultado = resultado.filter(
        (gastronomico) => gastronomico.zona.nombre === filtros.zona
      );
    }

    if (filtros.tipoComida) {
      resultado = resultado.filter(
        (gastronomico) => gastronomico.tipoComida === filtros.tipoComida
      );
    }

    if (filtros.precioMin) {
      resultado = resultado.filter(
        (gastronomico) => gastronomico.montoG >= parseInt(filtros.precioMin)
      );
    }

    if (filtros.precioMax) {
      resultado = resultado.filter(
        (gastronomico) => gastronomico.montoG <= parseInt(filtros.precioMax)
      );
    }

    setGastronomicosFiltrados(resultado);
  }, [filtros, gastronomicos]);

  const handleFiltroChange = (campo: keyof FilterState, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      zona: '',
      tipoComida: '',
      precioMin: '',
      precioMax: '',
    });
  };

  return (
    <div className="gastronomico-container">
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
              <label htmlFor="tipo-comida-filter">Tipo de Comida:</label>
              <select
                id="tipo-comida-filter"
                value={filtros.tipoComida}
                onChange={(e) =>
                  handleFiltroChange('tipoComida', e.target.value)
                }
              >
                <option value="">Todos los tipos</option>
                {tiposComida.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
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
        {gastronomicosFiltrados.length} resultado(s) encontrado(s)
      </div>

      <div className="gastronomicos-grid">
        {gastronomicosFiltrados.map((gastronomico) => (
          <div className="gastronomico-card" key={gastronomico.id}>
            <div className="gastronomico-img-container">
              <img
                src={buildImageUrl(gastronomico.foto)}
                alt={gastronomico.nombreG}
                className="gastronomico-img"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            </div>
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
          </div>
        ))}
      </div>
    </div>
  );
}
