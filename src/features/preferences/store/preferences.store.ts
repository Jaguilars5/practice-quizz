import {
  loadPreferences,
  savePreferences,
} from "@preferences/utils/preferences-storage.util";
import { create } from "zustand";

interface PreferencesState {
  soundEnabled: boolean;
  particlesEnabled: boolean;
  toggleSound: () => void;
  toggleParticles: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => {
  const initial = loadPreferences();
  return {
    soundEnabled: initial.soundEnabled,
    particlesEnabled: initial.particlesEnabled,
    toggleSound: () =>
      set((s) => {
        const next = { ...s, soundEnabled: !s.soundEnabled };
        savePreferences(next);
        return next;
      }),
    toggleParticles: () =>
      set((s) => {
        const next = { ...s, particlesEnabled: !s.particlesEnabled };
        savePreferences(next);
        return next;
      }),
  };
});
