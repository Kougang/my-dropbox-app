import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  user: any;
  children: ReactNode;
}

export default function ProtectedRoute({
  user,
  children,
}: ProtectedRouteProps) {
  // Si l'utilisateur n'est pas connecté, redirection vers la page de connexion
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est connecté, retourne les enfants (le contenu protégé)
  return <>{children}</>;
}
