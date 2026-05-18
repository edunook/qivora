import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";

export function useAuthBootstrap() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  useEffect(() => {
    if (!hydrated || !user) return;

    authService
      .me()
      .then((response) => {
        const storedToken = useAuthStore.getState().accessToken;
        if (storedToken) {
          setSession(response.user, storedToken);
        }
      })
      .catch(() => clearSession());
  }, [hydrated, user, setSession, clearSession]);
}
