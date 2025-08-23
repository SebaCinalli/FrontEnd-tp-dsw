import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../context/usercontext";
import { Login } from "../pages/login/login";
import { CreateUser } from "../pages/signup/signup";
import { MenuMain } from "../pages/menu/menu";
import { MenuAdmin } from "../pages/admin/menuAdmin";
import { ProtectedRoutes } from "../components/protectedroutes";
import {Salon} from "../pages/salon/salon";

export default function AppRoutes() {
  const { user } = useUser();
  const isAdmin = user?.rol === "administrador";

  return (

    // RUTAS PUBLICAS
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" /> : <CreateUser />}
      />

      //MENU PRINCIPAL
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            {isAdmin ? <MenuAdmin /> : <MenuMain />}
          </ProtectedRoutes>
        }
      />

      // RUTAS PROTEGIDAS PARA CLIENTES
      <Route
        path="/barra"
      />

      <Route
        path="/gastronomico"
      />

      <Route
        path="/salon"
        element={
        <ProtectedRoutes>
          <Salon/>
        </ProtectedRoutes>}
      />

      <Route
        path="/dj"
      />

      <Route
        path="/solicitud"
      />

      <Route
        path="/carrito"
      />


      //RUTAS PROTEGIDAS PARA ADMINISTRADORES
      <Route
        path="/barraAdmin"
      />

      <Route
        path="/gastronomicoAdmin"
      />

      <Route
        path="/salonAdmin"
      />

      <Route
        path="/djAdmin"
      />

      <Route
        path="/solicitudAdmin"
      />

      <Route
        path="/SalonAdmin"
      />
      {/* Ruta comodín */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
    </Routes>
  );
}
