import { useEffect, useState } from 'react';
import axios from 'axios';
import './barra.css';

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

export function Barra() {
  const [barras, setBarras] = useState<Barra[]>([]);

  useEffect(() => {
    const fetchBarras = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/barra', {
          withCredentials: true,
        });
        setBarras(response.data.data);
      } catch (error) {
        console.error('Error al cargar barras:', error);
      }
    };

    fetchBarras();
  }, []);

  return (
    <div className="barra-container">
      {barras.map((barra) => (
        <div className="barra-card" key={barra.id}>
          <img src={barra.foto} alt={barra.nombreB} className="barra-img" />
          <div className="barra-info">
            <h3 className="barra-name">{barra.nombreB}</h3>
            <p className="barra-bebida">
              Tipo Bebida: {barra.tipoBebida}
            </p>
            <p className="barra-montoB">
              ${barra.montoB.toLocaleString('es-AR')}
            </p>
            <p className="barra-zona">{barra.zona.nombre}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
