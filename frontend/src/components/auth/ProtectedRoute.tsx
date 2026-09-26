import { Navigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
