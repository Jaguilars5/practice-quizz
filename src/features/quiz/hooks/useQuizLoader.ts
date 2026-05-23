import { useEffect, useState } from 'react'
import { getLocalTests, getTestById, saveTestToLocal } from '@quizData'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { loadQuizProgress } from './useQuizProgress'
import { logError } from '@app/services/errorLogger'
import type { Test, Question } from '@shared/types'
import type { SavedQuiz } from './useQuizProgress'

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface UseQuizLoaderReturn {
  test: Test | null
  loading: boolean
  shuffledQuestions: Question[] | null
  optionMaps: Record<number, number[]>
  savedProgress: SavedQuiz | null
  showRestoreDialog: boolean
  setShowRestoreDialog: (show: boolean) => void
  onQuizStarted: () => void
}

export const useQuizLoader = (
  testId: string | undefined,
  user: { email: string; displayName: string } | null,
  navigate: (path: string) => void,
  setTest: (test: Test) => void,
  startQuiz: () => void,
): UseQuizLoaderReturn => {
  const [test, setTestState] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[] | null>(null)
  const [optionMaps, setOptionMaps] = useState<Record<number, number[]>>({})
  const [savedProgress, setSavedProgress] = useState<SavedQuiz | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const load = async () => {
      setLoading(true)

      const localTests = getLocalTests()
      let found: Test | null = localTests.find((t) => t.id === testId) || null

      if (!found && hasFirebaseConfig) {
        try {
          found = await getTestById(testId!)
          if (found) saveTestToLocal(found)
        } catch (error) {
          logError(error, 'useQuizLoader:getTestById')
        }
      }

      if (found) {
        let questions = [...found.questions]
        const maps: Record<number, number[]> = {}

        if (found.shuffleQuestions) {
          questions = shuffle(questions)
        }

        if (found.shuffleOptions) {
          questions = questions.map(q => {
            if (q.type === 'multiple' && q.options && q.options.length > 0) {
              const indices = q.options.map((_, i) => i)
              const shuffled = shuffle(indices)
              maps[q.id] = shuffled
            }
            return q
          })
        }

        const testForStore = found.shuffleQuestions ? { ...found, questions } : found
        setTestState(testForStore)
        setTest(testForStore)
        setShuffledQuestions(questions)
        setOptionMaps(maps)

        const saved = loadQuizProgress(testId!)
        if (saved && saved.answers.length > 0) {
          setSavedProgress(saved)
          setShowRestoreDialog(true)
        } else {
          startQuiz()
        }
      }
      setLoading(false)
    }

    load()
  }, [testId, user, navigate, setTest, startQuiz])

  return {
    test,
    loading,
    shuffledQuestions,
    optionMaps,
    savedProgress,
    showRestoreDialog,
    setShowRestoreDialog,
    onQuizStarted: () => startQuiz(),
  }
}
