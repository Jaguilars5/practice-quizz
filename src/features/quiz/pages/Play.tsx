import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@authState/useAuthStore'
import { useQuizStore } from '../state/useQuizStore'
import { usePreferencesStore } from '@preferences/store/usePreferencesStore'
import { submitAnswer, saveAnswerToLocal } from '@quizData'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { QuestionCard } from '../components/QuestionCard'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from '@shared/components/ui/Button'
import { Modal } from '@shared/components/ui/Modal'
import { playCorrectSound, playIncorrectSound } from '@preferences/utils/soundEffects'
import { saveQuizProgress, clearQuizProgress } from '../hooks/useQuizProgress'
import { useQuizLoader } from '../hooks/useQuizLoader'
import { useQuizTimer } from '../hooks/useQuizTimer'
import { ArrowLeft, Zap, Loader2, Volume2, VolumeX, Sparkles, RotateCcw, Play as PlayIcon } from 'lucide-react'
import type { Question } from '@shared/types'

export const Play = () => {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    currentQuestionIndex, streak,
    setTest, startQuiz, answerQuestion, nextQuestion, restoreQuiz, finishQuiz,
  } = useQuizStore()

  const { soundEnabled, particlesEnabled, toggleSound, toggleParticles } = usePreferencesStore()

  const {
    test, loading, shuffledQuestions, optionMaps,
    savedProgress, showRestoreDialog, setShowRestoreDialog, onQuizStarted,
  } = useQuizLoader(testId, user, navigate, setTest, startQuiz)

  const totalQuestions = shuffledQuestions?.length || test?.questions.length || 0

  const { timeLeft, startTimer, resetTimer, getElapsed } = useQuizTimer()

  const [selected, setSelected] = useState<number | boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  const finishedRef = useRef(false)
  const initializedRef = useRef(false)
  const autoAdvanceRef = useRef<number>(0)

  const advance = useCallback(() => {
    clearTimeout(autoAdvanceRef.current)
    setShowResult(false)
    setSelected(null)
    setShowNextButton(false)
    if (currentQuestionIndex + 1 < totalQuestions) {
      nextQuestion()
    } else if (!finishedRef.current) {
      finishedRef.current = true
      clearQuizProgress()
      const result = finishQuiz(user?.email || 'anonimo', user?.displayName || 'Anónimo')
      if (hasFirebaseConfig) {
        submitAnswer(result).catch(() => saveAnswerToLocal(result))
      } else {
        saveAnswerToLocal(result)
      }
      navigate('/results', { state: { answerSet: result, questions: test?.questions } })
    }
  }, [currentQuestionIndex, totalQuestions, nextQuestion, user, finishQuiz, navigate, test])

  const originalQuestion = (shuffledQuestions || test?.questions || [])[currentQuestionIndex]

  const displayQuestion: Question | null = useMemo(() => {
    if (!originalQuestion) return null
    if (originalQuestion.type !== 'multiple' || !optionMaps[originalQuestion.id]) {
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

  const handleAnswer = useCallback((value: number | boolean | null) => {
    if (showResult || !displayQuestion) return

    setSelected(value)
    const elapsed = Math.min(getElapsed(), displayQuestion.timeLimit)

    let originalValue: number | boolean | null = value
    if (typeof value === 'number' && optionMaps[displayQuestion.id]) {
      originalValue = optionMaps[displayQuestion.id][value]
    }

    let correctValue: number | boolean | null = originalValue
    if (displayQuestion.type === 'truefalse') {
      correctValue = originalValue === 0 ? true : originalValue === 1 ? false : null
    }
    const isCorrect = correctValue === originalQuestion.correct

    if (soundEnabled) {
      if (isCorrect) playCorrectSound()
      else playIncorrectSound()
    }

    if (particlesEnabled) {
      if (isCorrect) {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#4ade80', '#6366f1'],
        })
      } else {
        confetti({
          particleCount: 10,
          spread: 30,
          origin: { y: 0.7 },
          colors: ['#ef4444', '#f87171'],
          startVelocity: 20,
        })
      }
    }

    answerQuestion(originalValue, elapsed)
    setShowResult(true)
    setShowNextButton(true)

    const nextIndex = currentQuestionIndex + 1 < totalQuestions ? currentQuestionIndex + 1 : currentQuestionIndex
    saveQuizProgress({
      testId: testId!,
      currentQuestionIndex: nextIndex,
      answers: [...useQuizStore.getState().answers],
      startTime: useQuizStore.getState().startTime,
      streak: useQuizStore.getState().streak,
      maxStreak: useQuizStore.getState().maxStreak,
      shuffledQuestions,
      optionMaps,
      savedAt: Date.now(),
    })

    const delay = (test?.autoAdvance ?? 4) * 1000
    if (delay > 0) {
      autoAdvanceRef.current = window.setTimeout(() => {
        advance()
      }, delay)
    }
  }, [showResult, displayQuestion, optionMaps, originalQuestion, soundEnabled, particlesEnabled, answerQuestion, currentQuestionIndex, totalQuestions, testId, shuffledQuestions, test, advance, getElapsed])

  useEffect(() => {
    if (!displayQuestion) return
    startTimer(displayQuestion, () => handleAnswer(null))
    return () => resetTimer()
  }, [currentQuestionIndex, displayQuestion, startTimer, handleAnswer])

  const handleRestore = () => {
    if (!savedProgress || !test) return
    restoreQuiz(
      savedProgress.currentQuestionIndex,
      savedProgress.answers,
      savedProgress.streak,
      savedProgress.maxStreak,
      savedProgress.startTime,
    )
    if (savedProgress.shuffledQuestions) {
      // questions restored via store
    }
    setShowRestoreDialog(false)
    initializedRef.current = true
  }

  const handleStartOver = () => {
    clearQuizProgress()
    setShowRestoreDialog(false)
    onQuizStarted()
    initializedRef.current = true
  }

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
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-0 sm:px-0">
      {showRestoreDialog && savedProgress && (
        <Modal isOpen={true} onClose={() => {}} title="Quiz en progreso">
          <div className="space-y-4">
            <p className="text-gray-300">
              Tenés <strong>{savedProgress.answers.length}</strong> de <strong>{totalQuestions}</strong> preguntas respondidas.
              ¿Querés continuar donde lo dejaste o empezar de cero?
            </p>
            <div className="flex gap-3">
              <Button onClick={handleRestore} className="flex-1">
                <PlayIcon size={16} /> Continuar
              </Button>
              <Button variant="secondary" onClick={handleStartOver} className="flex-1">
                <RotateCcw size={16} /> Empezar de cero
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white truncate">{test.title}</h1>
          <ProgressBar current={currentQuestionIndex} total={totalQuestions} />
        </div>
        <button
          onClick={toggleSound}
          className={`p-2 rounded-lg transition-all ${soundEnabled ? 'text-gray-400 hover:text-white' : 'text-gray-600'}`}
          title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button
          onClick={toggleParticles}
          className={`p-2 rounded-lg transition-all ${particlesEnabled ? 'text-gray-400 hover:text-white' : 'text-gray-600'}`}
          title={particlesEnabled ? 'Desactivar partículas' : 'Activar partículas'}
        >
          <Sparkles size={18} className={particlesEnabled ? '' : 'opacity-30'} />
        </button>
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

      {showNextButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-2"
        >
          <Button onClick={advance} size="lg">
            {currentQuestionIndex + 1 < totalQuestions ? 'Siguiente' : 'Ver resultados'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
