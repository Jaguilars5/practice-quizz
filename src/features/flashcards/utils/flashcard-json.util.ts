import type { Flashcard } from "@flashcards/types/flashcard.types";

let cardIdCounter = Date.now();

export interface ParsedFlashcardJson {
  title?: string;
  cards: { front: string; back: string }[];
}

export const parseFlashcardJson = (
  jsonText: string,
): ParsedFlashcardJson | null => {
  try {
    const parsed = JSON.parse(jsonText);
    const importedCards = parsed.cards || parsed.questions || [];
    if (!Array.isArray(importedCards) || importedCards.length === 0)
      return null;

    const cards = importedCards.map(
      (c: {
        front?: string;
        back?: string;
        text?: string;
        question?: string;
        answer?: string;
        explanation?: string;
      }) => ({
        front: c.front || c.text || c.question || "",
        back: c.back || c.answer || c.explanation || "",
      }),
    );

    return {
      title: parsed.title,
      cards,
    };
  } catch {
    return null;
  }
};

export const importFlashcardCards = (
  parsed: ParsedFlashcardJson,
): Flashcard[] => {
  return parsed.cards.map((c) => ({
    id: cardIdCounter++,
    front: c.front,
    back: c.back,
  }));
};

export const getCardIdCounter = () => cardIdCounter;

export const setCardIdCounter = (value: number) => {
  cardIdCounter = value;
};

export const createEmptyCard = (): Flashcard => ({
  id: cardIdCounter++,
  front: "",
  back: "",
});

export const createExampleJson = (): string => {
  const example = {
    title: "Mi set de tarjetas",
    description: "Descripción opcional",
    cards: [{ front: "Pregunta / concepto", back: "Respuesta / definición" }],
  };
  return JSON.stringify(example, null, 2);
};
