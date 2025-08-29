import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/usercontext';
import './BackToMenu.css';

interface BackToMenuProps {
  className?: string;
}

export const BackToMenu: React.FC<BackToMenuProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleBackToMenu = () => {
    if (user?.rol === 'Admin') {
      navigate('/menuAdmin');
    } else {
      navigate('/menu');
    }
  };

  return (
    <button
      className={`back-to-menu-btn ${className}`}
      onClick={handleBackToMenu}
      title="Volver al menú"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      Volver al Menú
    </button>
  );
};
