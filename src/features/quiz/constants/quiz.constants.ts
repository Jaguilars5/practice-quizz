export const TEST_STORAGE_KEY = "tests" as const;
export const ANSWERS_STORAGE_KEY = "answers" as const;
export const QUIZ_PROGRESS_KEY = "quiz_progress" as const;
export const TEST_COLLECTION = "tests" as const;
export const ANSWERS_COLLECTION = "answers" as const;
export const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" as const;
export const CODE_LENGTH = 6 as const;

export const generateCode = (): string => {
  const chars = CODE_CHARS;
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
