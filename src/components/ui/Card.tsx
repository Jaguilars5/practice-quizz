import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 ${onClick ? 'cursor-pointer hover:border-primary-500/50 transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
