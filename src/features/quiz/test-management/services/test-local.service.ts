import { TEST_STORAGE_KEY } from "@quiz/constants/quiz.constants";
import type { Test } from "@quiz/test-management/types/test.types";

export const getLocalTests = (): Test[] => {
  return JSON.parse(localStorage.getItem(TEST_STORAGE_KEY) || "[]");
};

export const saveTestToLocal = (test: Test): void => {
  const stored = getLocalTests();
  const idx = stored.findIndex((t) => t.id === test.id);
  if (idx >= 0) {
    stored[idx] = test;
  } else {
    stored.push(test);
  }
  localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(stored));
};

export const getLocalTestByCode = (code: string): Test | null => {
  return getLocalTests().find((t) => t.code === code) || null;
};

export const deleteTestLocal = (id: string): void => {
  const updated = getLocalTests().filter((t) => t.id !== id);
  localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(updated));
};

export const setLocalTests = (tests: Test[]): void => {
  localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(tests));
};
