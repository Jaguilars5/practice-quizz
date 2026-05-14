import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useQuizStore } from '../store/useQuizStore'
import { getLocalTests, getTestById, saveTestToLocal } from '../firebase/testsService'
import { submitAnswer, saveAnswerToLocal } from '../firebase/answersService'
import { hasFirebaseConfig } from '../firebase/config'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { ProgressBar } from '../components/quiz/ProgressBar'
import { Button } from '../components/ui/Button'
import { ArrowLeft, Zap, Loader2 } from 'lucide-react'
import type { Test, Question } from '../types'

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const Play = () => {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentQuestionIndex, streak, isFinished,
    setTest, startQuiz, answerQuestion, nextQuestion, finishQuiz,
  } = useQuizStore()

  const [test, setTestState] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selected, setSelected] = useState<number | boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const timerRef = useRef<number>(0)
  const answerTimerRef = useRef<number>(0)
  const finishedRef = useRef(false)

  const [optionMaps, setOptionMaps] = useState<Record<number, number[]>>({})
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[] | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const loadTest = async () => {
      setLoading(true)
      let found: Test | null = null

      const localTests = getLocalTests()
      found = localTests.find((t) => t.id === testId) || null

      if (!found && hasFirebaseConfig) {
        try {
          found = await getTestById(testId!)
          if (found) saveTestToLocal(found)
        } catch {
          // fallback
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

        setTestState(found)
        setTest(found)
        setShuffledQuestions(questions)
        setOptionMaps(maps)
      }
      setLoading(false)
    }

    loadTest()
  }, [testId, user, navigate, setTest])

  useEffect(() => {
    if (test) startQuiz()
  }, [test, startQuiz])

  const originalQuestion = (shuffledQuestions || test?.questions || [])[currentQuestionIndex]

  const displayQuestion: Question | null = useMemo(() => {
    if (!originalQuestion) return null
    if (!originalQuestion || originalQuestion.type !== 'multiple' || !optionMaps[originalQuestion.id]) {
      return originalQuestion
    }
    const map = optionMaps[originalQuestion.id]
    const opts = originalQuestion.options || []
    return {
      ...originalQuestion,
      options: map.map(i => opts[i]),
      correct: map.indexOf(originalQuestion.correct as number),
    }
  }, [originalQuestion, optionMaps])

  const totalQuestions = shuffledQuestions?.length || test?.questions.length || 0

  const startTimer = useCallback(() => {
    if (!displayQuestion) return
    setTimeLeft(displayQuestion.timeLimit)
    setSelected(null)
    setShowResult(false)

    const start = Date.now()
    answerTimerRef.current = start

    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const left = displayQuestion.timeLimit - elapsed
      setTimeLeft(Math.max(0, left))
      if (left <= 0) {
        clearInterval(timerRef.current)
        handleAnswer(null)
      }
    }, 100)
  }, [displayQuestion])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [currentQuestionIndex, startTimer])

  const handleAnswer = (value: number | boolean | null) => {
    if (showResult || !displayQuestion) return
    clearInterval(timerRef.current)
    setSelected(value)

    const elapsed = Math.min((Date.now() - answerTimerRef.current) / 1000, displayQuestion.timeLimit)

    let originalValue = value
    if (typeof value === 'number' && optionMaps[displayQuestion.id]) {
      originalValue = optionMaps[displayQuestion.id][value]
    }

    answerQuestion(originalValue, elapsed)
    setShowResult(true)

    setTimeout(() => {
      if (currentQuestionIndex + 1 < totalQuestions) {
        nextQuestion()
      } else {
        finishQuiz(user?.email || 'anonimo', user?.displayName || 'Anónimo')
      }
    }, 1500)
  }

  useEffect(() => {
    if (isFinished && !finishedRef.current) {
      finishedRef.current = true
      const result = finishQuiz(user?.email || 'anonimo', user?.displayName || 'Anónimo')
      if (hasFirebaseConfig) {
        submitAnswer(result).catch(() => saveAnswerToLocal(result))
      } else {
        saveAnswerToLocal(result)
      }
      navigate('/results', { state: { answerSet: result } })
    }
  }, [isFinished])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  if (!test || !displayQuestion) {
    return (
      <div className="text-center py-20 text-gray-500">
        Test no encontrado
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">{test.title}</h1>
          <ProgressBar current={currentQuestionIndex} total={totalQuestions} />
        </div>
      </div>

      {streak >= 3 && (
        <div className="flex items-center justify-center gap-2 text-yellow-400 animate-pulse">
          <Zap size={20} />
          <span className="font-bold">Racha x{streak >= 5 ? 2 : 1.5}</span>
        </div>
      )}

      <QuestionCard
        question={displayQuestion}
        selectedAnswer={selected}
        onSelect={handleAnswer}
        timeLeft={timeLeft}
        showResult={showResult}
        currentIndex={currentQuestionIndex}
        total={totalQuestions}
      />
    </div>
  )
}
