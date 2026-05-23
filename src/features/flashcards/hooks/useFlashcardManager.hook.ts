import type { Flashcard } from "@flashcards/types/flashcard.types";
import { createEmptyCard } from "@flashcards/utils/flashcard-json.util";
import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export const useFlashcardManager = (initialCards: Flashcard[]) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);

  const handleCardChange = useCallback((index: number, card: Flashcard) => {
    setCards((prev) => {
      const updated = [...prev];
      updated[index] = card;
      return updated;
    });
  }, []);

  const removeCard = useCallback((index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addCard = useCallback(() => {
    setCards((prev) => [...prev, createEmptyCard()]);
  }, []);

  return {
    cards,
    setCards: setCards as Dispatch<SetStateAction<Flashcard[]>>,
    handleCardChange,
    removeCard,
    addCard,
  };
};
