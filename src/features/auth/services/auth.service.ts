import { auth, googleProvider } from "@shared/services/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error("Firebase no configurado");
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logout = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
