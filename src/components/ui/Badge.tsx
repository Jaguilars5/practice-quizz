import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: 'primary' | 'green' | 'yellow' | 'red' | 'gray'
  className?: string
}

const colors = {
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  gray: 'bg-gray-700/50 text-gray-300 border-gray-600/30',
}

export const Badge = ({ children, color = 'gray', className = '' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
