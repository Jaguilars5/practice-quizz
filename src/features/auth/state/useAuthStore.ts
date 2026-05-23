import { create } from 'zustand'
import type { User } from '../types'
import { onAuthChange } from '@authData'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  init: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  init: () => {
    const saved = localStorage.getItem('auth_user')
    if (saved) {
      set({ user: JSON.parse(saved), loading: false })
    }
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const u: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
        }
        localStorage.setItem('auth_user', JSON.stringify(u))
        set({ user: u, loading: false })
      } else {
        localStorage.removeItem('auth_user')
        set({ user: null, loading: false })
      }
    })
    return unsubscribe
  },
}))
