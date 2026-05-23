import { FLASHCARD_STORAGE_KEY } from "@flashcards/constants/flashcard.constants";
import type { FlashcardSet } from "@flashcards/types/flashcard.types";

export const getLocalFlashcardSets = (): FlashcardSet[] => {
  return JSON.parse(localStorage.getItem(FLASHCARD_STORAGE_KEY) || "[]");
};

const saveToLocal = (sets: FlashcardSet[]) => {
  localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(sets));
};

export const saveFlashcardSetToLocal = (set: FlashcardSet) => {
  const stored = getLocalFlashcardSets();
  const idx = stored.findIndex((s) => s.id === set.id);
  if (idx >= 0) {
    stored[idx] = set;
  } else {
    stored.push(set);
  }
  saveToLocal(stored);
};

export const getLocalFlashcardSetByCode = (
  code: string,
): FlashcardSet | null => {
  return getLocalFlashcardSets().find((s) => s.code === code) || null;
};

export const deleteFlashcardSetLocal = (id: string) => {
  const updated = getLocalFlashcardSets().filter((s) => s.id !== id);
  saveToLocal(updated);
};
