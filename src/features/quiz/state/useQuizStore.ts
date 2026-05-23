import { create } from 'zustand'
import type { Test, PlayerAnswer, AnswerSet, AnswerStats } from '../types'
import { calculateScore } from '@shared/utils/scoreCalculator'

interface QuizState {
  currentTest: Test | null
  currentQuestionIndex: number
  answers: PlayerAnswer[]
  startTime: number
  streak: number
  maxStreak: number
  isFinished: boolean
  answerSet: AnswerSet | null

  setTest: (test: Test) => void
  startQuiz: () => void
  answerQuestion: (selectedOption: number | boolean | null, timeUsed: number) => void
  nextQuestion: () => void
  restoreQuiz: (index: number, savedAnswers: PlayerAnswer[], savedStreak: number, savedMaxStreak: number, savedStartTime: number) => void
  finishQuiz: (playerId: string, playerName: string) => AnswerSet
  reset: () => void
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

  startQuiz: () => set({
    currentQuestionIndex: 0,
    answers: [],
    startTime: Date.now(),
    streak: 0,
    maxStreak: 0,
    isFinished: false,
    answerSet: null,
  }),

  answerQuestion: (selectedOption, timeUsed) => {
    const { currentTest, currentQuestionIndex, answers, streak, maxStreak } = get()
    if (!currentTest) return

    const question = currentTest.questions[currentQuestionIndex]
    if (question.type === 'truefalse') {
      selectedOption = selectedOption === 0 ? true : selectedOption === 1 ? false : null
    }
    const isCorrect = selectedOption === question.correct

    const newStreak = isCorrect ? streak + 1 : 0
    const newMaxStreak = Math.max(maxStreak, newStreak)
    const multiplier = newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1

    const { base, bonus } = calculateScore(isCorrect, timeUsed, question.timeLimit, multiplier)

    const answer: PlayerAnswer = {
      questionId: question.id,
      selectedOption,
      isCorrect,
      timeUsed,
      pointsEarned: base,
      bonusPoints: bonus,
      questionText: question.text,
      options: question.options,
      correctAnswer: question.correct,
      explanation: question.explanation,
    }

    set({
      answers: [...answers, answer],
      streak: newStreak,
      maxStreak: newMaxStreak,
    })
  },

  nextQuestion: () => {
    const { currentTest, currentQuestionIndex } = get()
    if (!currentTest) return
    if (currentQuestionIndex + 1 < currentTest.questions.length) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 })
    }
  },

  restoreQuiz: (index: number, savedAnswers: PlayerAnswer[], savedStreak: number, savedMaxStreak: number, savedStartTime: number) => {
    set({
      currentQuestionIndex: index,
      answers: savedAnswers,
      streak: savedStreak,
      maxStreak: savedMaxStreak,
      startTime: savedStartTime,
      isFinished: false,
      answerSet: null,
    })
  },

  finishQuiz: (playerId, playerName) => {
    const { currentTest, answers, startTime, maxStreak } = get()
    if (!currentTest) throw new Error('No hay test activo')

    const correctCount = answers.filter(a => a.isCorrect).length
    const incorrectCount = answers.length - correctCount
    const totalScore = answers.reduce((s, a) => s + a.pointsEarned + a.bonusPoints, 0)
    const maxScore = currentTest.questions.reduce((s, q) => s + q.points, 0)
    const totalTime = answers.reduce((s, a) => s + a.timeUsed, 0)
    const avgTime = answers.length > 0 ? totalTime / answers.length : 0

    const stats: AnswerStats = {
      correct: correctCount,
      incorrect: incorrectCount,
      accuracy: `${Math.round((correctCount / currentTest.questions.length) * 100)}%`,
      avgTime,
      maxStreak,
    }

    const answerSet: AnswerSet = {
      testId: currentTest.id,
      testTitle: currentTest.title,
      testCode: currentTest.code,
      playerId,
      playerName,
      startedAt: new Date(startTime).toISOString(),
      finishedAt: new Date().toISOString(),
      totalScore,
      maxScore,
      answers,
      stats,
    }

    set({ isFinished: true, answerSet })
    return answerSet
  },

  reset: () => set({
    currentTest: null,
    currentQuestionIndex: 0,
    answers: [],
    startTime: 0,
    streak: 0,
    maxStreak: 0,
    isFinished: false,
    answerSet: null,
  }),
}))

