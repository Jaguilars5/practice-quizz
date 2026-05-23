import { AUTH_STORAGE_KEY } from "@auth/constants/auth.constants";
import type { User } from "@auth/types/auth.types";

export const getStoredUser = (): User | null => {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const storeUser = (user: User): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
