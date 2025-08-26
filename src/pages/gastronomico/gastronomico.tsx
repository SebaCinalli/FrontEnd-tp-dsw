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

export function Gastronomico() {
  const [gastronomicos, setGastronomicos] = useState<Gastronomico[]>([]);

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

    fetchGastronomicos();
  }, []);

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
        </div>
      ))}
    </div>
  );
}
