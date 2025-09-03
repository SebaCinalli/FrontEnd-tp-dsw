import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../context/usercontext';
import { Login } from '../pages/login/login';
import { CreateUser } from '../pages/signup/signup';
import { MenuMain } from '../pages/menu/menu';
import { MenuAdmin } from '../pages/admin/menuAdmin';
import { ProtectedRoutes } from '../components/protectedroutes';
import { Salon } from '../pages/salon/salon';
import { Barra } from '../pages/barra/barra';
import { Dj } from '../pages/dj/dj';
import { Gastronomico } from '../pages/gastronomico/gastronomico';
import { Carrito } from '../pages/carrito/carrito';
import { SolicitudAdmin } from '../pages/admin/solicitud/solicitudAdmin';
import { SalonAdmin } from '../pages/admin/salon/salonAdmin';
import { BarraAdmin } from '../pages/admin/barra/barraAdmin';
import { DjAdmin } from '../pages/admin/dj/djAdmin';
import { GastronomicoAdmin } from '../pages/admin/gastronomico/gastronomicoAdmin';
import { ZonaAdmin } from '../pages/admin/zona/zonaAdmin';
import { Solicitud } from '../pages/solicitud/solicitud';
import { Profile } from '../pages/profile/profile';

export default function AppRoutes() {
  const { user } = useUser();
  const isAdmin = user?.rol === 'administrador';

  return (
    <Routes>
      {/* RUTAS PUBLICAS */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/force-login" element={<Login />} />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" /> : <CreateUser />}
      />
      {/* MENU PRINCIPAL */}
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            {isAdmin ? <MenuAdmin /> : <MenuMain />}
          </ProtectedRoutes>
        }
      />
      {/* RUTAS PROTEGIDAS PARA USUARIOS */}
      <Route
        path="/barra"
        element={
          <ProtectedRoutes>
            <Barra />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/gastronomico"
        element={
          <ProtectedRoutes>
            <Gastronomico />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/salon"
        element={
          <ProtectedRoutes>
            <Salon />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/dj"
        element={
          <ProtectedRoutes>
            <Dj />
          </ProtectedRoutes>
        }
      />
      {/* /solicitud no es pública; ruta admin abajo */}
      <Route
        path="/solicitud"
        element={
          <ProtectedRoutes>
            <Solicitud />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/carrito"
        element={
          <ProtectedRoutes>
            <Carrito />
          </ProtectedRoutes>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        }
      />

      {/* RUTAS PROTEGIDAS PARA ADMINISTRADORES */}
      <Route
        path="/barraAdmin"
        element={
          <ProtectedRoutes>
            <BarraAdmin />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/gastronomicoAdmin"
        element={
          <ProtectedRoutes>
            <GastronomicoAdmin />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/salonAdmin"
        element={
          <ProtectedRoutes>
            <SalonAdmin />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/djAdmin"
        element={
          <ProtectedRoutes>
            <DjAdmin />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/zonaAdmin"
        element={
          <ProtectedRoutes>
            <ZonaAdmin />
          </ProtectedRoutes>
        }
      />
      <Route
        path="/solicitudAdmin"
        element={
          <ProtectedRoutes>
            {isAdmin ? <SolicitudAdmin /> : <Navigate to="/" />}
          </ProtectedRoutes>
        }
      />
      {/* Ruta comodín */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
    </Routes>
  );
}
