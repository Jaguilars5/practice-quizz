export interface Question {
  id: number;
  text: string;
  type: "multiple" | "truefalse";
  options?: string[];
  correct: number | boolean;
  explanation: string;
  points: number;
  timeLimit: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "facil" | "medio" | "dificil";
  timePerQuestion: number;
  createdBy: string;
  createdAt: string;
  questions: Question[];
  visibility: "global" | "private";
  code: string;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  folderId?: string;
  autoAdvance?: number;
}
