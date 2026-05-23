import type { AnswerSet } from "@quiz/answers/types/answer.types";
import { ANSWERS_STORAGE_KEY } from "@quiz/constants/quiz.constants";

export const getLocalAnswers = (
  testId?: string,
  playerId?: string,
): AnswerSet[] => {
  let all: AnswerSet[] = JSON.parse(
    localStorage.getItem(ANSWERS_STORAGE_KEY) || "[]",
  );
  if (testId) all = all.filter((a) => a.testId === testId);
  if (playerId) all = all.filter((a) => a.playerId === playerId);
  return all;
};

export const saveAnswerToLocal = (answer: AnswerSet): void => {
  const stored = JSON.parse(localStorage.getItem(ANSWERS_STORAGE_KEY) || "[]");
  stored.push(answer);
  localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(stored));
};

export const setLocalAnswers = (answers: AnswerSet[]): void => {
  localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
};
