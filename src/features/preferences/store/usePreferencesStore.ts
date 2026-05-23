import { create } from 'zustand'

interface PreferencesState {
  soundEnabled: boolean
  particlesEnabled: boolean
  toggleSound: () => void
  toggleParticles: () => void
}

const load = () => {
  try {
    const raw = localStorage.getItem('preferences')
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { soundEnabled: true, particlesEnabled: true }
}

const save = (state: { soundEnabled: boolean; particlesEnabled: boolean }) => {
  localStorage.setItem('preferences', JSON.stringify(state))
}

export const usePreferencesStore = create<PreferencesState>((set) => {
  const initial = load()
  return {
    soundEnabled: initial.soundEnabled,
    particlesEnabled: initial.particlesEnabled,
    toggleSound: () => set((s) => {
      const next = { ...s, soundEnabled: !s.soundEnabled }
      save(next)
      return next
    }),
    toggleParticles: () => set((s) => {
      const next = { ...s, particlesEnabled: !s.particlesEnabled }
      save(next)
      return next
    }),
  }
})
