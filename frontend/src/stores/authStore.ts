import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  hydrated: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
}

const storageKey = "qivora-auth";

function readStorage() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  hydrated: false,
  setSession: (user, accessToken) => {
    localStorage.setItem(storageKey, JSON.stringify({ user, accessToken }));
    set({ user, accessToken });
  },
  clearSession: () => {
    localStorage.removeItem(storageKey);
    set({ user: null, accessToken: null });
  },
  setHydrated: (hydrated) => {
    if (hydrated) {
      const stored = readStorage();
      set({
        user: stored?.user || null,
        accessToken: stored?.accessToken || null,
        hydrated: true
      });
      return;
    }

    set({ hydrated: false });
  }
}));
