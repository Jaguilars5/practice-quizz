import type { AnswerSet } from "@quiz/answers/types/answer.types";
import type {
  AnswerStats,
  PlayerAnswer,
} from "@quiz/game-engine/types/game.types";
import {
  calculateAnswerResult,
  calculateAnswerStats,
} from "@quiz/game-engine/utils/quiz-scoring.util";
import type { Test } from "@quiz/test-management/types/test.types";
import { create } from "zustand";

interface QuizState {
  currentTest: Test | null;
  currentQuestionIndex: number;
  answers: PlayerAnswer[];
  startTime: number;
  streak: number;
  maxStreak: number;
  isFinished: boolean;
  answerSet: AnswerSet | null;

  setTest: (test: Test) => void;
  startQuiz: () => void;
  answerQuestion: (
    selectedOption: number | boolean | null,
    timeUsed: number,
  ) => void;
  nextQuestion: () => void;
  restoreQuiz: (
    index: number,
    savedAnswers: PlayerAnswer[],
    savedStreak: number,
    savedMaxStreak: number,
    savedStartTime: number,
  ) => void;
  finishQuiz: (playerId: string, playerName: string) => AnswerSet;
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentTest: null,
  currentQuestionIndex: 0,
  answers: [],
  startTime: 0,
  streak: 0,
  maxStreak: 0,
  isFinished: false,
  answerSet: null,

  setTest: (test) => set({ currentTest: test }),

  startQuiz: () =>
    set({
      currentQuestionIndex: 0,
      answers: [],
      startTime: Date.now(),
      streak: 0,
      maxStreak: 0,
      isFinished: false,
      answerSet: null,
    }),

  answerQuestion: (selectedOption, timeUsed) => {
    const { currentTest, currentQuestionIndex, answers, streak, maxStreak } =
      get();
    if (!currentTest) return;

    const question = currentTest.questions[currentQuestionIndex];
    if (question.type === "truefalse") {
      selectedOption =
        selectedOption === 0 ? true : selectedOption === 1 ? false : null;
    }

    const { answer, newStreak, newMaxStreak } = calculateAnswerResult(
      question,
      selectedOption,
      timeUsed,
      streak,
      maxStreak,
    );

    set({
      answers: [...answers, answer],
      streak: newStreak,
      maxStreak: newMaxStreak,
    });
  },

  nextQuestion: () => {
    const { currentTest, currentQuestionIndex } = get();
    if (!currentTest) return;
    if (currentQuestionIndex + 1 < currentTest.questions.length) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  restoreQuiz: (
    index,
    savedAnswers,
    savedStreak,
    savedMaxStreak,
    savedStartTime,
  ) => {
    set({
      currentQuestionIndex: index,
      answers: savedAnswers,
      streak: savedStreak,
      maxStreak: savedMaxStreak,
      startTime: savedStartTime,
      isFinished: false,
      answerSet: null,
    });
  },

  finishQuiz: (playerId, playerName) => {
    const { currentTest, answers, startTime, maxStreak } = get();
    if (!currentTest) throw new Error("No hay test activo");

    const statsData = calculateAnswerStats(answers, maxStreak);

    const stats: AnswerStats = {
      correct: statsData.correct,
      incorrect: statsData.incorrect,
      accuracy: statsData.accuracy,
      avgTime: statsData.avgTime,
      maxStreak: statsData.maxStreak,
    };

    const answerSet: AnswerSet = {
      testId: currentTest.id,
      testTitle: currentTest.title,
      testCode: currentTest.code,
      playerId,
      playerName,
      startedAt: new Date(startTime).toISOString(),
      finishedAt: new Date().toISOString(),
      totalScore: statsData.totalScore,
      maxScore: currentTest.questions.reduce((s, q) => s + q.points, 0),
      answers,
      stats,
    };

    set({ isFinished: true, answerSet });
    return answerSet;
  },

  reset: () =>
    set({
      currentTest: null,
      currentQuestionIndex: 0,
      answers: [],
      startTime: 0,
      streak: 0,
      maxStreak: 0,
      isFinished: false,
      answerSet: null,
    }),
}));
