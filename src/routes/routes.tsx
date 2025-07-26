import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../context/usercontext";
import { Login } from "../pages/login/login";
import { CreateUser } from "../pages/signup/signup";
import { MenuMain } from "../pages/menu/menu";
import { ProtectedRoutes } from "../components/protectedroutes";

export default function AppRoutes() {
  const { user } = useUser();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" /> : <CreateUser />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoutes>
            <MenuMain />
          </ProtectedRoutes>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
    </Routes>
  );
}
