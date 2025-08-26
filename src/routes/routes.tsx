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
import { SalonAdmin } from '../pages/admin/salon/salonAdmin';
import { BarraAdmin } from '../pages/admin/barra/barraAdmin';
import { DjAdmin } from '../pages/admin/dj/djAdmin';
import { GastronomicoAdmin } from '../pages/admin/gastronomico/gastronomicoAdmin';

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
      <Route path="/solicitud" />
      <Route path="/carrito" />
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
      <Route path="/solicitudAdmin" />
      {/* Ruta comodín */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
    </Routes>
  );
}
