import './solicitudAdmin.css';
import { UserBadge } from '../../../components/userbadge';
import { BackToMenu } from '../../../components/BackToMenu';

export function SolicitudAdmin() {
  return (
    <div className="solicitud-admin-container">
      <BackToMenu className="admin-style" />
      <UserBadge />

      <div className="solicitud-admin-content">
        <h2>Solicitudes</h2>
        <p className="en-desarrollo">Componente en desarrollo</p>
      </div>
    </div>
  );
}

export default SolicitudAdmin;
