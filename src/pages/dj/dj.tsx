import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './dj.css';
import { UserBadge } from '../../components/userbadge';
import { BackToMenu } from '../../components/BackToMenu';
import { useCart } from '../../context/cartcontext';
import { useUser } from '../../context/usercontext';
import { useEventDate } from '../../context/eventdatecontext';
import { useNavigate } from 'react-router-dom';

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
  precioMin: string;
  precioMax: string;
}

export function Dj() {
  const [djs, setDjs] = useState<Dj[]>([]);
  const [djsFiltrados, setDjsFiltrados] = useState<Dj[]>([]);
  const [filtros, setFiltros] = useState<FilterState>({
    zona: '',
    precioMin: '',
    precioMax: '',
  });
  const [zonas, setZonas] = useState<string[]>([]);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const { addItem, isInCart, removeItem } = useCart();
  const { user } = useUser();
  const { eventDate } = useEventDate();
  const eventDateParam = useMemo(() => eventDate ?? '', [eventDate]);
  const fechaDMY = useMemo(() => {
    if (!eventDateParam) return '';
    const [y, m, d] = eventDateParam.split('-');
    return `${d}/${m}/${y}`;
  }, [eventDateParam]);
  const navigate = useNavigate();

  const handleAddToCart = (dj: Dj) => {
    const cartItem = {
      id: dj.id,
      type: 'dj' as const,
      name: dj.nombreArtistico,
      price: dj.montoDj,
      image: dj.foto,
      details: {
        estado: dj.estado,
        zona: dj.zona.nombre,
      },
    };

    const added = addItem(cartItem);

    if (!added) return;

    try {
      const imgEl = document.querySelector(
        `.dj-card img[alt="${dj.nombreArtistico}"]`
      ) as HTMLImageElement | null;
      const img =
        imgEl ||
        (document.querySelector(
          `img[alt="${dj.nombreArtistico}"]`
        ) as HTMLImageElement | null);
      const rect = img
        ? img.getBoundingClientRect()
        : { left: 0, top: 0, width: 40, height: 40 };
      const detail = {
        src: img?.src || '/placeholder-image.svg',
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
      window.dispatchEvent(new CustomEvent('fly-to-cart', { detail }));
    } catch (e) {
      // ignore
    }
  };

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
        const url = fechaDMY
          ? `http://localhost:3000/api/dj?fecha=${encodeURIComponent(fechaDMY)}`
          : 'http://localhost:3000/api/dj';
        const response = await axios.get(url, {
          withCredentials: true,
        });
        const data = response.data.data;
        setDjs(data);
        setDjsFiltrados(data);
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
        // Extraer todas las zonas disponibles del sistema con validación
        const todasLasZonas = data
          .map((zona: any) => zona.nombre?.trim())
          .filter((nombre: string) => nombre && nombre.length > 0)
          .filter(
            (nombre: string, index: number, array: string[]) =>
              array.indexOf(nombre) === index
          );
        setZonas(todasLasZonas);
      } catch (error) {
        console.error('Error al cargar zonas:', error);
      }
    };

    fetchDjs();
    fetchZonas();
  }, [fechaDMY]);

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultado = [...djs];

    if (filtros.zona) {
      // Filtrado robusto que maneja comparación exacta y normalizada
      resultado = resultado.filter((dj) => {
        if (!dj.zona?.nombre) return false;

        // Primero intentamos comparación exacta
        if (dj.zona.nombre === filtros.zona) {
          return true;
        }

        // Como fallback, comparación normalizada (sin espacios y en minúsculas)
        const zonaDj = dj.zona.nombre.trim().toLowerCase();
        const zonaBuscada = filtros.zona.trim().toLowerCase();
        return zonaDj === zonaBuscada;
      });
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
      precioMin: '',
      precioMax: '',
    });
  };

  return (
    <div className="dj-container">
      <BackToMenu />
      <UserBadge />

      {!eventDate && (
        <div
          className="warning"
          style={{
            background: '#fde68a',
            color: '#92400e',
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          Seleccioná una fecha en el menú principal para ver disponibilidad por
          fecha.
          <button style={{ marginLeft: 12 }} onClick={() => navigate('/')}>
            Ir al menú
          </button>
        </div>
      )}

      {/* Contenedor layout: filtros + resultados */}
      <div className="dj-layout">
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
                <button
                  onClick={limpiarFiltros}
                  className="limpiar-filtros-btn"
                >
                  Limpiar filtros
                </button>
              </div>
              {/* Resultados - se muestra después de los filtros */}
              <div className="resultados-count">
                {djsFiltrados.length} resultado(s) encontrado(s)
                {eventDate && (
                  <div style={{ color: '#94a3b8' }}>
                    Fecha seleccionada: {fechaDMY}
                  </div>
                )}
              </div>
            </div>
          </div>
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
                <p className="dj-montoS">
                  ${dj.montoDj.toLocaleString('es-AR')}
                </p>
                <p className="dj-zona">{dj.zona.nombre}</p>
              </div>

              {/* Botón Agregar al carrito - solo para clientes */}
              {user?.rol !== 'administrador' && (
                <div className="dj-actions">
                  {isInCart(dj.id, 'dj') ? (
                    <div className="in-cart-actions">
                      <button className={`add-to-cart-btn added`} disabled>
                        <span>✓</span> Agregado
                      </button>
                      <button
                        className="remove-from-cart-btn"
                        onClick={() => removeItem(dj.id, 'dj')}
                        aria-label={`Eliminar ${dj.nombreArtistico} del carrito`}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`add-to-cart-btn ${
                        isInCart(dj.id, 'dj') ? 'added' : ''
                      }`}
                      onClick={() => handleAddToCart(dj)}
                      disabled={isInCart(dj.id, 'dj')}
                    >
                      <>
                        <span>🛒</span> Agregar
                      </>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
