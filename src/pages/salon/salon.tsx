import { useEffect, useState } from 'react';
import axios from 'axios';
import './salon.css';
import { UserBadge } from '../../components/userbadge';

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

export function Salon() {
  const [salones, setSalones] = useState<Salon[]>([]);

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

    fetchSalones();
  }, []);

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
        </div>
      ))}
    </div>
  );
}
