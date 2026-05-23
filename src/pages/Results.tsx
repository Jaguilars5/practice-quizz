import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { getLocalTests } from '../firebase/testsService'
import { ScoreDisplay } from '../components/quiz/ScoreDisplay'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { AnswerDetail } from '../components/quiz/AnswerDetail'
import { exportAnswersAsJson } from '../utils/jsonExporter'
import { Home, Download, RotateCcw, PartyPopper, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { AnswerSet } from '../types'

export const Results = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [answerSet] = useState<AnswerSet | null>(location.state?.answerSet)
  const questions = (location.state as { questions?: import('../types').Question[] })?.questions
    || (answerSet ? getLocalTests().find(t => t.id === answerSet.testId)?.questions : undefined)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  useEffect(() => {
    if (answerSet && answerSet.stats.accuracy) {
      const acc = parseInt(answerSet.stats.accuracy)
      if (acc >= 80) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#818cf8', '#a5b4fc', '#fbbf24'],
        })
      }
    }
  }, [answerSet])

  if (!answerSet) {
    navigate('/')
    return null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {parseInt(answerSet.stats.accuracy) >= 80 && (
        <div className="flex justify-center">
          <PartyPopper size={48} className="text-yellow-400" />
        </div>
      )}

      <h1 className="text-2xl font-bold text-white text-center">
        {answerSet.testTitle}
      </h1>

      <Card>
        <ScoreDisplay
          totalScore={answerSet.totalScore}
          maxScore={answerSet.maxScore}
          stats={answerSet.stats}
        />
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        <Button variant="secondary" onClick={() => navigate('/')} className="flex-1">
          <Home size={16} /> Inicio
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/play/${answerSet.testId}`)} className="flex-1">
          <RotateCcw size={16} /> Reintentar
        </Button>
        <Button variant="secondary" onClick={() => navigate('/leaderboard')} className="flex-1">
          <Trophy size={16} /> Ranking
        </Button>
        <Button onClick={() => exportAnswersAsJson(answerSet)}>
          <Download size={16} /> Exportar
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-bold text-white">Detalle de respuestas</h2>
        {answerSet.answers.map((a, i) => {
          const q = questions?.[i]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            >
              <AnswerDetail
                index={i}
                questionText={q?.text || a.questionText}
                options={q?.options || a.options}
                selectedOption={a.selectedOption}
                isCorrect={a.isCorrect}
                pointsEarned={a.pointsEarned}
                bonusPoints={a.bonusPoints}
                timeUsed={a.timeUsed}
                correctAnswer={q?.correct ?? a.correctAnswer}
                explanation={q?.explanation || a.explanation}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
