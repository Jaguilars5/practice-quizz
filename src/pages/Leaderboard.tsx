import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { getLocalAnswers } from '../firebase/answersService'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowLeft, Trophy, Medal } from 'lucide-react'
import type { AnswerSet } from '../types'

export const Leaderboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<AnswerSet[]>([])

  useEffect(() => {
    if (!user) navigate('/login')
    else setAnswers(getLocalAnswers())
  }, [user, navigate])

  const grouped = answers.reduce<Record<string, { name: string; total: number; count: number }>>((acc, a) => {
    if (!acc[a.playerId]) {
      acc[a.playerId] = { name: a.playerName, total: 0, count: 0 }
    }
    acc[a.playerId].total += a.totalScore
    acc[a.playerId].count++
    return acc
  }, {})

  const sorted = Object.entries(grouped)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)

  const podium = ['text-yellow-400', 'text-gray-300', 'text-amber-600']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aún no hay resultados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
            >
            <Card className="flex items-center gap-4">
              <div className="w-10 text-center">
                {i < 3 ? (
                  <Medal size={24} className={podium[i]} />
                ) : (
                  <span className="text-gray-500 font-bold">{i + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <span className="text-white font-semibold">{entry.name}</span>
                <Badge color="gray" className="ml-2">
                  {entry.count} partida{entry.count !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-400">{entry.total}</div>
                <div className="text-xs text-gray-500">pts totales</div>
              </div>
            </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
