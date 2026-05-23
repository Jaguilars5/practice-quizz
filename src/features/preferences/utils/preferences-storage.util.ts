import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
} from "@preferences/constants/preferences.constants";

export const loadPreferences = () => {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { ...DEFAULT_PREFERENCES };
};

export const savePreferences = (state: {
  soundEnabled: boolean;
  particlesEnabled: boolean;
}) => {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(state));
};
