import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { auth, googleProvider } from './config'

export const loginWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error('Firebase no configurado')
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export const logout = async () => {
  if (!auth) return
  await signOut(auth)
}

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}
