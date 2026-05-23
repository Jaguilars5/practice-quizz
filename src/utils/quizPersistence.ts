import type { PlayerAnswer, Question } from '../types'

export interface SavedQuiz {
  testId: string
  currentQuestionIndex: number
  answers: PlayerAnswer[]
  startTime: number
  streak: number
  maxStreak: number
  shuffledQuestions: Question[] | null
  optionMaps: Record<number, number[]>
  savedAt: number
}

const STORAGE_KEY = 'quiz_progress'

export const saveQuizProgress = (data: SavedQuiz) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage full or unavailable
  }
}

export const loadQuizProgress = (testId: string): SavedQuiz | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SavedQuiz
    if (data.testId !== testId) return null
    if (data.answers.length === 0) return null
    return data
  } catch {
    return null
  }
}

export const clearQuizProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
