import { useEffect, useState } from 'react';
import axios from 'axios';
import './barra.css';
import { UserBadge } from '../../components/userbadge';

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

interface FilterState {
  zona: string;
  tipoBebida: string;
  precioMin: string;
  precioMax: string;
}

export function Barra() {
  const [barras, setBarras] = useState<Barra[]>([]);
  const [barrasFiltradas, setBarrasFiltradas] = useState<Barra[]>([]);
  const [filtros, setFiltros] = useState<FilterState>({
    zona: '',
    tipoBebida: '',
    precioMin: '',
    precioMax: '',
  });
  const [zonas, setZonas] = useState<string[]>([]);
  const [tiposBebida, setTiposBebida] = useState<string[]>([]);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  // Función helper para construir URLs de imagen
  const buildImageUrl = (fileName: string | undefined) => {
    if (!fileName) return '/placeholder-image.svg';
    // Si ya es una URL completa, devolverla tal como está
    if (fileName.startsWith('http')) return fileName;
    // Si es solo el nombre del archivo, construir la URL completa
    return `http://localhost:3000/uploads/barras/${fileName}`;
  };

  useEffect(() => {
    const fetchBarras = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/barra', {
          withCredentials: true,
        });
        const data = response.data.data;
        setBarras(data);
        setBarrasFiltradas(data);

        // Extraer tipos de bebida únicos
        const tiposUnicos = [
          ...new Set(data.map((barra: Barra) => barra.tipoBebida)),
        ] as string[];
        setTiposBebida(tiposUnicos);
      } catch (error) {
        console.error('Error al cargar barras:', error);
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

    fetchBarras();
    fetchZonas();
  }, []);

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultado = [...barras];

    if (filtros.zona) {
      resultado = resultado.filter(
        (barra) => barra.zona.nombre === filtros.zona
      );
    }

    if (filtros.tipoBebida) {
      resultado = resultado.filter(
        (barra) => barra.tipoBebida === filtros.tipoBebida
      );
    }

    if (filtros.precioMin) {
      resultado = resultado.filter(
        (barra) => barra.montoB >= parseInt(filtros.precioMin)
      );
    }

    if (filtros.precioMax) {
      resultado = resultado.filter(
        (barra) => barra.montoB <= parseInt(filtros.precioMax)
      );
    }

    setBarrasFiltradas(resultado);
  }, [filtros, barras]);

  const handleFiltroChange = (campo: keyof FilterState, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      zona: '',
      tipoBebida: '',
      precioMin: '',
      precioMax: '',
    });
  };

  return (
    <div className="barra-container">
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
              <label htmlFor="tipo-bebida-filter">Tipo de Bebida:</label>
              <select
                id="tipo-bebida-filter"
                value={filtros.tipoBebida}
                onChange={(e) =>
                  handleFiltroChange('tipoBebida', e.target.value)
                }
              >
                <option value="">Todos los tipos</option>
                {tiposBebida.map((tipo) => (
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
        {barrasFiltradas.length} resultado(s) encontrado(s)
      </div>

      <div className="barras-grid">
        {barrasFiltradas.map((barra) => (
          <div className="barra-card" key={barra.id}>
            <div className="barra-img-container">
              <img
                src={buildImageUrl(barra.foto)}
                alt={barra.nombreB}
                className="barra-img"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            </div>
            <div className="barra-info">
              <h3 className="barra-name">{barra.nombreB}</h3>
              <p className="barra-bebida">Tipo Bebida: {barra.tipoBebida}</p>
              <p className="barra-montoB">
                ${barra.montoB.toLocaleString('es-AR')}
              </p>
              <p className="barra-zona">{barra.zona.nombre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
