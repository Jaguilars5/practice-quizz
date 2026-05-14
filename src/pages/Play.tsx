import { useEffect, useRef, useState, useCallback } from 'react'
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
import type { Test } from '../types'

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
        setTestState(found)
        setTest(found)
      }
      setLoading(false)
    }

    loadTest()
  }, [testId, user, navigate, setTest])

  useEffect(() => {
    if (test) startQuiz()
  }, [test, startQuiz])

  const currentQuestion = test?.questions[currentQuestionIndex]

  const startTimer = useCallback(() => {
    if (!currentQuestion) return
    setTimeLeft(currentQuestion.timeLimit)
    setSelected(null)
    setShowResult(false)

    const start = Date.now()
    answerTimerRef.current = start

    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const left = currentQuestion.timeLimit - elapsed
      setTimeLeft(Math.max(0, left))
      if (left <= 0) {
        clearInterval(timerRef.current)
        handleAnswer(null)
      }
    }, 100)
  }, [currentQuestion])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [currentQuestionIndex, startTimer])

  const handleAnswer = (value: number | boolean | null) => {
    if (showResult) return
    clearInterval(timerRef.current)
    setSelected(value)

    const elapsed = currentQuestion
      ? Math.min((Date.now() - answerTimerRef.current) / 1000, currentQuestion.timeLimit)
      : 0

    answerQuestion(value, elapsed)
    setShowResult(true)

    setTimeout(() => {
      if (test && currentQuestionIndex + 1 < test.questions.length) {
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

  if (!test || !currentQuestion) {
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
          <ProgressBar current={currentQuestionIndex} total={test.questions.length} />
        </div>
      </div>

      {streak >= 3 && (
        <div className="flex items-center justify-center gap-2 text-yellow-400 animate-pulse">
          <Zap size={20} />
          <span className="font-bold">Racha x{streak >= 5 ? 2 : 1.5}</span>
        </div>
      )}

      <QuestionCard
        question={currentQuestion}
        selectedAnswer={selected}
        onSelect={handleAnswer}
        timeLeft={timeLeft}
        showResult={showResult}
        currentIndex={currentQuestionIndex}
        total={test.questions.length}
      />
    </div>
  )
}
