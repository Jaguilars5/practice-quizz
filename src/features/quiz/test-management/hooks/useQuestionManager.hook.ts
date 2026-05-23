import type { Question, Test } from "@quiz/test-management/types/test.types";
import { importTestFromJson } from "@shared/utils/jsonImporter";
import { useCallback, useState } from "react";

let questionIdCounter = Date.now();

const emptyQuestion = (): Question => ({
  id: questionIdCounter++,
  text: "",
  type: "multiple",
  options: ["", "", "", ""],
  correct: 0,
  explanation: "",
  points: 100,
  timeLimit: 20,
});

interface UseQuestionManagerReturn {
  questions: Question[];
  handleQuestionChange: (index: number, q: Question) => void;
  removeQuestion: (index: number) => void;
  addQuestion: () => void;
  setQuestions: (questions: Question[]) => void;
  handleImportQuestions: (
    onTitleFound?: (title: string) => void,
  ) => Promise<void>;
  importQuestionsFromTest: (test: Test) => void;
}

export const useQuestionManager = (
  initialQuestions?: Question[],
): UseQuestionManagerReturn => {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions?.map((q) => ({ ...q })) || [emptyQuestion()],
  );

  const handleQuestionChange = useCallback((index: number, q: Question) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = q;
      return updated;
    });
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }, []);

  const importQuestionsFromTest = useCallback((test: Test) => {
    setQuestions((prev) => [
      ...prev,
      ...test.questions.map((q) => ({ ...q, id: questionIdCounter++ })),
    ]);
  }, []);

  const handleImportQuestions = useCallback(
    async (onTitleFound?: (title: string) => void) => {
      try {
        const test = await importTestFromJson();
        const newQuestions = test.questions.map((q) => ({
          ...q,
          id: questionIdCounter++,
        }));
        if (newQuestions.length === 0) return;
        if (onTitleFound) onTitleFound(test.title);
        setQuestions((prev) => [...prev, ...newQuestions]);
      } catch {
        // user cancelled or error
      }
    },
    [],
  );

  return {
    questions,
    handleQuestionChange,
    removeQuestion,
    addQuestion,
    setQuestions,
    handleImportQuestions,
    importQuestionsFromTest,
  };
};
