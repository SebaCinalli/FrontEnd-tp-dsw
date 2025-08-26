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

export function Dj() {
  const [djs, setDjs] = useState<Dj[]>([]);

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

    fetchDjs();
  }, []);

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
        </div>
      ))}
    </div>
  );
}
