import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@shared/components/ui/Badge'
import type { AnswerStats } from '../types'

interface ScoreDisplayProps {
  totalScore: number
  maxScore: number
  stats: AnswerStats
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayed(value)
        clearInterval(timer)
      } else {
        setDisplayed(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return <>{displayed}</>
}

export const ScoreDisplay = ({ totalScore, maxScore, stats }: ScoreDisplayProps) => {
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative inline-flex items-center justify-center"
      >
        <svg width="180" height="180" className="-rotate-90">
          <circle cx="90" cy="90" r="78" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
          <motion.circle
            cx="90" cy="90" r="78" fill="none" stroke="currentColor" strokeWidth="8"
            strokeDasharray={490}
            strokeDashoffset={490 * (1 - percentage / 100)}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeDashoffset: 490 * (1 - percentage / 100) }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={percentage >= 80 ? 'text-green-400' : percentage >= 50 ? 'text-yellow-400' : 'text-red-400'}
          />
        </svg>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="absolute text-center"
        >
          <div className="text-4xl font-bold text-white">
            <AnimatedNumber value={totalScore} />
          </div>
          <div className="text-sm text-gray-400">/ {maxScore}</div>
        </motion.div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Badge color="green">{stats.correct} correctas</Badge>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Badge color="red">{stats.incorrect} incorrectas</Badge>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Badge color="yellow">{stats.accuracy}</Badge>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-gray-400 text-sm"
      >
        Tiempo promedio: {stats.avgTime.toFixed(1)}s · Racha máxima: {stats.maxStreak}
      </motion.div>
    </motion.div>
  )
}

