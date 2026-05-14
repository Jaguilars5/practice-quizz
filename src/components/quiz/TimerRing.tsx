import { motion } from 'framer-motion'

interface TimerRingProps {
  timeLeft: number
  timeLimit: number
}

export const TimerRing = ({ timeLeft, timeLimit }: TimerRingProps) => {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const progress = timeLeft / timeLimit
  const offset = circumference * (1 - progress)
  const isUrgent = timeLeft <= timeLimit * 0.25

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
      className="relative inline-flex items-center justify-center"
    >
      <svg width="72" height="72" className="-rotate-90">
        <circle
          cx="36" cy="36" r={radius}
          fill="none" stroke="currentColor" strokeWidth="4"
          className="text-gray-800"
        />
        <motion.circle
          cx="36" cy="36" r={radius}
          fill="none" stroke="currentColor" strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={isUrgent ? 'text-red-500' : 'text-primary-400'}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </svg>
      <motion.span
        animate={isUrgent ? { color: '#f87171' } : { color: '#ffffff' }}
        className="absolute text-lg font-bold"
      >
        {timeLeft}
      </motion.span>
    </motion.div>
  )
}
