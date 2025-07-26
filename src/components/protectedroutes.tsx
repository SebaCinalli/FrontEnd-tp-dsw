import type { JSX } from 'react';
import { Navigate } from "react-router-dom";
import { useUser } from "../context/usercontext";

const ProtectedRoutes = ({ children }: { children: JSX.Element }) => {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" replace />;
};

export { ProtectedRoutes };
