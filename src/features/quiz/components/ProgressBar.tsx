import { motion } from 'framer-motion'

interface ProgressBarProps {
  current: number
  total: number
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

