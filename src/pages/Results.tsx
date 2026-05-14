import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { ScoreDisplay } from '../components/quiz/ScoreDisplay'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { exportAnswersAsJson } from '../utils/jsonExporter'
import { Home, Download, RotateCcw, PartyPopper } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { AnswerSet } from '../types'

export const Results = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [answerSet] = useState<AnswerSet | null>(location.state?.answerSet)

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
    <div className="max-w-lg mx-auto space-y-6">
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

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/')} className="flex-1">
          <Home size={16} /> Inicio
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/play/${answerSet.testId}`)} className="flex-1">
          <RotateCcw size={16} /> Reintentar
        </Button>
        <Button onClick={() => exportAnswersAsJson(answerSet)}>
          <Download size={16} /> Exportar
        </Button>
      </div>

      <div className="space-y-3">
        {answerSet.answers.map((a, i) => {
          return (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
                a.isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <span className="text-gray-300">Pregunta {i + 1}</span>
              <div className="flex items-center gap-3">
                <span className={a.isCorrect ? 'text-green-400' : 'text-red-400'}>
                  {a.isCorrect ? `+${a.pointsEarned}` : '0'}
                  {a.bonusPoints > 0 && <span className="text-yellow-400 ml-1">+{a.bonusPoints}</span>}
                </span>
                <span className="text-gray-500">{a.timeUsed.toFixed(1)}s</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
