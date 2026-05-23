import { useEffect, useRef, useState, useCallback } from 'react'
import type { Question } from '@shared/types'

interface UseQuizTimerReturn {
  timeLeft: number
  startTimer: (question: Question, onTimeout: () => void) => void
  resetTimer: () => void
  getElapsed: () => number
}

export const useQuizTimer = (): UseQuizTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
  }, [])

  const getElapsed = useCallback(() => {
    return (Date.now() - startTimeRef.current) / 1000
  }, [])

  const startTimer = useCallback((question: Question, onTimeout: () => void) => {
    clearInterval(timerRef.current)
    setTimeLeft(question.timeLimit)
    startTimeRef.current = Date.now()

    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const left = question.timeLimit - elapsed
      setTimeLeft(Math.max(0, left))
      if (left <= 0) {
        clearInterval(timerRef.current)
        onTimeout()
      }
    }, 100)
  }, [])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  return { timeLeft, startTimer, resetTimer, getElapsed }
}
