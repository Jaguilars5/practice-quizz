import { logError } from "@app/services/errorLogger";
import {
  getLocalFlashcardSets,
  saveFlashcardSetToFirestore,
  saveFlashcardSetToLocal,
} from "@flashcards/services";
import type { FlashcardSet } from "@flashcards/types/flashcard.types";
import { hasFirebaseConfig } from "@shared/services/firebase";
import { useCallback } from "react";

export const useFlashcardSync = () => {
  const saveSet = useCallback(
    async (
      setData: Omit<FlashcardSet, "id">,
      editSet?: FlashcardSet | null,
    ): Promise<string> => {
      let savedId = editSet?.id || `fc_${Date.now()}`;

      if (hasFirebaseConfig) {
        try {
          const id = await saveFlashcardSetToFirestore({ ...setData, id: "" });
          if (id) {
            const existing = getLocalFlashcardSets().find(
              (s) => s.id === id || (setData.code && s.code === setData.code),
            );
            if (existing) {
              saveFlashcardSetToLocal({
                ...existing,
                ...setData,
                id: existing.id,
              });
            } else {
              saveFlashcardSetToLocal({ ...setData, id });
            }
            savedId = id;
          }
        } catch (error) {
          logError(error, "useFlashcardSync:saveSet");
          saveFlashcardSetToLocal({ ...setData, id: savedId });
        }
      } else {
        saveFlashcardSetToLocal({ ...setData, id: savedId });
      }

      return savedId;
    },
    [],
  );

  return { saveSet };
};
