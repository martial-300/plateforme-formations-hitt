import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Role } from "../api/types";
import { useAuth } from "./useAuth";

// Confort d'interface uniquement : le contrôle réel des droits est fait par l'API.
export function RouteProtegee({ role, children }: { role?: Role; children: ReactNode }) {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();

  if (chargement) return null;
  if (!utilisateur) return <Navigate to="/connexion" replace state={{ depuis: location }} />;
  if (role && utilisateur.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
