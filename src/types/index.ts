export interface Question {
  id: number
  text: string
  type: 'multiple' | 'truefalse'
  options?: string[]
  correct: number | boolean
  explanation: string
  points: number
  timeLimit: number
}

export interface Test {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'facil' | 'medio' | 'dificil'
  timePerQuestion: number
  createdBy: string
  createdAt: string
  questions: Question[]
  visibility: 'global' | 'private'
  code: string
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
  folderId?: string
}

export interface Folder {
  id: string
  name: string
  createdBy: string
  createdAt: string
}

export interface PlayerAnswer {
  questionId: number
  selectedOption: number | boolean | null
  isCorrect: boolean
  timeUsed: number
  pointsEarned: number
  bonusPoints: number
}

export interface AnswerStats {
  correct: number
  incorrect: number
  accuracy: string
  avgTime: number
  maxStreak: number
}

export interface AnswerSet {
  testId: string
  testTitle: string
  testCode: string
  playerId: string
  playerName: string
  startedAt: string
  finishedAt: string
  totalScore: number
  maxScore: number
  answers: PlayerAnswer[]
  stats: AnswerStats
}

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string
}
