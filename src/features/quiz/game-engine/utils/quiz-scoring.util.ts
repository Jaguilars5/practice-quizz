import type { PlayerAnswer } from "@quiz/game-engine/types/game.types";
import type { Question } from "@quiz/test-management/types/test.types";

export const calculateCorrectValue = (
  displayQuestion: Question,
  value: number | boolean | null,
  optionMaps: Record<number, number[]>,
): number | boolean | null => {
  if (value === null) return null;

  let originalValue: number | boolean | null = value;
  if (typeof value === "number" && optionMaps[displayQuestion.id]) {
    originalValue = optionMaps[displayQuestion.id][value];
  }

  if (displayQuestion.type === "truefalse") {
    return originalValue === 0 ? true : originalValue === 1 ? false : null;
  }

  return originalValue;
};

export const calculateAnswerResult = (
  question: Question,
  selectedOption: number | boolean | null,
  timeUsed: number,
  streak: number,
  maxStreak: number,
) => {
  const isCorrect = selectedOption === question.correct;
  const newStreak = isCorrect ? streak + 1 : 0;
  const newMaxStreak = Math.max(maxStreak, newStreak);
  const multiplier = newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1;

  const basePoints = isCorrect
    ? Math.max(0, question.points * (1 - timeUsed / (question.timeLimit * 2)))
    : 0;
  const bonusPoints = isCorrect
    ? Math.round(question.points * (multiplier - 1))
    : 0;

  const answer: PlayerAnswer = {
    questionId: question.id,
    selectedOption,
    isCorrect,
    timeUsed,
    pointsEarned: Math.round(basePoints),
    bonusPoints,
    questionText: question.text,
    options: question.options,
    correctAnswer: question.correct,
    explanation: question.explanation,
  };

  return { answer, newStreak, newMaxStreak };
};

export const calculateAnswerStats = (
  answers: PlayerAnswer[],
  maxStreak: number,
) => {
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const incorrectCount = answers.length - correctCount;
  const totalScore = answers.reduce(
    (s, a) => s + a.pointsEarned + a.bonusPoints,
    0,
  );
  const totalTime = answers.reduce((s, a) => s + a.timeUsed, 0);
  const avgTime = answers.length > 0 ? totalTime / answers.length : 0;

  return {
    correct: correctCount,
    incorrect: incorrectCount,
    accuracy: `${Math.round((correctCount / answers.length) * 100)}%`,
    avgTime,
    maxStreak,
    totalScore,
  };
};
