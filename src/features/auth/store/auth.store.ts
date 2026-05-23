import { onAuthChange } from "@auth/services";
import type { User } from "@auth/types/auth.types";
import {
  clearStoredUser,
  getStoredUser,
  storeUser,
} from "@auth/utils/auth-storage.util";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  init: () => {
    const saved = getStoredUser();
    if (saved) {
      set({ user: saved, loading: false });
    }
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const u: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
        };
        storeUser(u);
        set({ user: u, loading: false });
      } else {
        clearStoredUser();
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },
}));
