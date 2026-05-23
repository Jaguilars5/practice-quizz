import { QUIZ_PROGRESS_KEY } from "@quiz/constants/quiz.constants";
import type { PlayerAnswer } from "@quiz/game-engine/types/game.types";
import type { Question } from "@quiz/test-management/types/test.types";

export interface SavedQuiz {
  testId: string;
  currentQuestionIndex: number;
  answers: PlayerAnswer[];
  startTime: number;
  streak: number;
  maxStreak: number;
  shuffledQuestions: Question[] | null;
  optionMaps: Record<number, number[]>;
  savedAt: number;
}

export const saveQuizProgress = (data: SavedQuiz): void => {
  try {
    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
};

export const loadQuizProgress = (testId: string): SavedQuiz | null => {
  try {
    const raw = localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedQuiz;
    if (data.testId !== testId) return null;
    if (data.answers.length === 0) return null;
    return data;
  } catch {
    return null;
  }
};

export const clearQuizProgress = (): void => {
  try {
    localStorage.removeItem(QUIZ_PROGRESS_KEY);
  } catch {
    // ignore
  }
};
