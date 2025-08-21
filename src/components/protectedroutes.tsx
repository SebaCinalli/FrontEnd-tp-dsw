// ProtectedRoutes.tsx
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/usercontext";

interface ProtectedRoutesProps {
  children: JSX.Element;
  rol?: string; // opcional, si no lo pasás solo valida login
}

const ProtectedRoutes = ({ children, rol }: ProtectedRoutesProps) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (rol && user.rol !== rol) {
    // si tiene rol distinto, lo mando a home o adonde quieras
    return <Navigate to="/" replace />;
  }

  return children;
};

export { ProtectedRoutes };
