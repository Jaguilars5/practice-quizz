import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variantClasses = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25',
  secondary: 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700',
  ghost: 'bg-transparent hover:bg-white/10 text-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-5 py-2.5',
  lg: 'text-lg px-7 py-3',
}

export const Button = ({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) => {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizes[size]} ${className}`
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={cls}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {children}
    </motion.button>
  )
}

