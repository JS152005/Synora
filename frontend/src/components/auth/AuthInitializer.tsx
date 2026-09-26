import { useEffect, useState } from "react";
import { useAuth } from "../../features/auth/useAuth";

interface AuthInitializerProps {
  children: React.ReactNode;
}

function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const { loadUser } = useAuth();

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadUser();
      } catch {
        // User is not logged in
      } finally {
        setInitialized(true);
      }
    };

    initialize();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthInitializer;
