import { motion } from 'framer-motion'
import { Badge } from '../ui/Badge'
import type { AnswerStats } from '../../types'

interface ScoreDisplayProps {
  totalScore: number
  maxScore: number
  stats: AnswerStats
}

export const ScoreDisplay = ({ totalScore, maxScore, stats }: ScoreDisplayProps) => {
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="relative inline-flex items-center justify-center">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
          <circle
            cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="8"
            strokeDasharray={440}
            strokeDashoffset={440 * (1 - percentage / 100)}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-bold text-white">{totalScore}</div>
          <div className="text-sm text-gray-400">/ {maxScore}</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Badge color="green">{stats.correct} correctas</Badge>
        <Badge color="red">{stats.incorrect} incorrectas</Badge>
        <Badge color="yellow">{stats.accuracy}</Badge>
      </div>

      <div className="text-gray-400 text-sm">
        Tiempo promedio: {stats.avgTime.toFixed(1)}s · Racha máxima: {stats.maxStreak}
      </div>
    </motion.div>
  )
}
