import type { Test } from "@quiz/test-management/types/test.types";

export interface PlayerAnswer {
  questionId: number;
  selectedOption: number | boolean | null;
  isCorrect: boolean;
  timeUsed: number;
  pointsEarned: number;
  bonusPoints: number;
  questionText?: string;
  options?: string[];
  correctAnswer?: number | boolean;
  explanation?: string;
}

export interface AnswerStats {
  correct: number;
  incorrect: number;
  accuracy: string;
  avgTime: number;
  maxStreak: number;
}

export interface GameState {
  currentTest: Test | null;
  currentQuestionIndex: number;
  answers: PlayerAnswer[];
  startTime: number;
  streak: number;
  maxStreak: number;
  isFinished: boolean;
}
