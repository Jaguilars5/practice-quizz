import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -4, borderColor: 'rgba(99, 102, 241, 0.3)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

