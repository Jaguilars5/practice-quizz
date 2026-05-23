import { logError } from "@app/services/errorLogger";
import {
  getFlashcardSetById,
  getLocalFlashcardSets,
  saveFlashcardSetToLocal,
} from "@flashcards/services";
import type { FlashcardSet } from "@flashcards/types/flashcard.types";
import { hasFirebaseConfig } from "@shared/services/firebase";
import { useEffect, useState } from "react";

export const useFlashcardLoader = (setId?: string | null) => {
  const [set, setSetState] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(() => setId != null);

  useEffect(() => {
    if (!setId) {
      return;
    }

    const load = async () => {
      setLoading(true);
      let found: FlashcardSet | null;

      const local = getLocalFlashcardSets();
      found = local.find((s) => s.id === setId) || null;

      if (!found && hasFirebaseConfig) {
        try {
          found = await getFlashcardSetById(setId);
          if (found) saveFlashcardSetToLocal(found);
        } catch (error) {
          logError(error, "useFlashcardLoader:load");
        }
      }

      if (found) setSetState(found);
      setLoading(false);
    };
    load();
  }, [setId]);

  return { set, loading };
};
