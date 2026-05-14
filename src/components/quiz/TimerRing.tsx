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
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-gray-800"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${isUrgent ? 'text-red-500' : 'text-primary-400'}`}
        />
      </svg>
      <span className={`absolute text-lg font-bold ${isUrgent ? 'text-red-400' : 'text-white'}`}>
        {timeLeft}
      </span>
    </div>
  )
}
