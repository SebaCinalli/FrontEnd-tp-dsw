import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './barra.css';
import { UserBadge } from '../../components/userbadge';
import { BackToMenu } from '../../components/BackToMenu';
import { useCart } from '../../context/cartcontext';
import { useUser } from '../../context/usercontext';
import { useEventDate } from '../../context/eventdatecontext';
import { useNavigate } from 'react-router-dom';

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

  const { addItem, isInCart, removeItem } = useCart();
  const { user } = useUser();
  const { eventDate } = useEventDate();
  const navigate = useNavigate();
  const eventDateParam = useMemo(() => eventDate ?? '', [eventDate]);
  const fechaDMY = useMemo(() => {
    if (!eventDateParam) return '';
    const [y, m, d] = eventDateParam.split('-');
    return `${d}/${m}/${y}`;
  }, [eventDateParam]);

  const handleAddToCart = (barra: Barra) => {
    const cartItem = {
      id: barra.id,
      type: 'barra' as const,
      name: barra.nombreB,
      price: barra.montoB,
      image: barra.foto,
      details: {
        tipoBebida: barra.tipoBebida,
        zona: barra.zona.nombre,
      },
    };

    const added = addItem(cartItem);

    if (!added) return;

    try {
      const imgEl = document.querySelector(
        `.barra-card img[alt="${barra.nombreB}"]`
      ) as HTMLImageElement | null;
      const img =
        imgEl ||
        (document.querySelector(
          `img[alt="${barra.nombreB}"]`
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
    return `http://localhost:3000/uploads/barras/${fileName}`;
  };

  useEffect(() => {
    const fetchBarras = async () => {
      try {
        const url = fechaDMY
          ? `http://localhost:3000/api/barra?fecha=${encodeURIComponent(
              fechaDMY
            )}`
          : 'http://localhost:3000/api/barra';
        const response = await axios.get(url, {
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

    fetchBarras();
    fetchZonas();
  }, [fechaDMY]);

  // Efecto para aplicar filtros
  useEffect(() => {
    let resultado = [...barras];

    if (filtros.zona) {
      // Filtrado robusto que maneja comparación exacta y normalizada
      resultado = resultado.filter((barra) => {
        if (!barra.zona?.nombre) return false;

        // Primero intentamos comparación exacta
        if (barra.zona.nombre === filtros.zona) {
          return true;
        }

        // Como fallback, comparación normalizada (sin espacios y en minúsculas)
        const zonaBarra = barra.zona.nombre.trim().toLowerCase();
        const zonaBuscada = filtros.zona.trim().toLowerCase();
        return zonaBarra === zonaBuscada;
      });
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
      <div className="barra-layout">
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
                <button
                  onClick={limpiarFiltros}
                  className="limpiar-filtros-btn"
                >
                  Limpiar filtros
                </button>
              </div>
              {/* Resultados - se muestra después de los filtros */}
              <div className="resultados-count">
                {barrasFiltradas.length} resultado(s) encontrado(s)
                {eventDate && (
                  <div style={{ color: '#94a3b8' }}>
                    Fecha seleccionada: {fechaDMY}
                  </div>
                )}
              </div>
            </div>
          </div>
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

              {/* Botón Agregar al carrito - solo para clientes */}
              {user?.rol !== 'administrador' && (
                <div className="barra-actions">
                  {isInCart(barra.id, 'barra') ? (
                    <div className="in-cart-actions">
                      <button className={`add-to-cart-btn added`} disabled>
                        <span>✓</span> Agregado
                      </button>
                      <button
                        className="remove-from-cart-btn"
                        onClick={() => removeItem(barra.id, 'barra')}
                        aria-label={`Eliminar ${barra.nombreB} del carrito`}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`add-to-cart-btn ${
                        isInCart(barra.id, 'barra') ? 'added' : ''
                      }`}
                      onClick={() => handleAddToCart(barra)}
                      disabled={isInCart(barra.id, 'barra')}
                    >
                      <>
                        <span>🛒</span> Agregar al carrito
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
