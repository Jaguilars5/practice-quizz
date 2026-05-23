import { motion } from 'framer-motion'

interface AnswerOptionProps {
  text: string
  selected: boolean
  correct: boolean
  wrong: boolean
  disabled: boolean
  onClick: () => void
  borderColor: string
}

export const AnswerOption = ({ text, selected, correct, wrong, disabled, onClick, borderColor }: AnswerOptionProps) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, x: 4 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      animate={correct ? { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', scale: [1, 1.03, 1] } : wrong ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', x: [0, -4, 4, -2, 0] } : selected ? { borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)' } : {}}
      transition={correct ? { scale: { duration: 0.3 } } : wrong ? { x: { duration: 0.4 } } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-5 py-4 rounded-xl border bg-gray-800/50 backdrop-blur-sm transition-colors duration-200 ${borderColor} ${disabled ? 'cursor-default' : ''}`}
    >
      <motion.span
        animate={correct ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
        className="text-white font-medium"
      >
        {text}
      </motion.span>
    </motion.button>
  )
}

