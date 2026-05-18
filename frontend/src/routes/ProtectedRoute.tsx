import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { user, hydrated } = useAuthStore();
  if (!hydrated) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
