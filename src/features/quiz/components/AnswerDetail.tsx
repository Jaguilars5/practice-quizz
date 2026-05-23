import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@shared/components/ui/Badge'
import { Check, X } from 'lucide-react'

interface AnswerDetailProps {
  index: number
  questionText?: string
  options?: string[]
  selectedOption: number | boolean | null
  isCorrect: boolean
  pointsEarned: number
  bonusPoints: number
  timeUsed: number
  correctAnswer?: number | boolean
  explanation?: string
}

export const AnswerDetail = ({
  index, questionText, options, selectedOption, isCorrect,
  pointsEarned, bonusPoints, timeUsed, correctAnswer, explanation,
}: AnswerDetailProps) => {
  const [expanded, setExpanded] = useState(false)
  const allOptions = options || []
  const selectedText = selectedOption !== null && selectedOption !== undefined
    ? allOptions[typeof selectedOption === 'number' ? selectedOption : (selectedOption ? 0 : 1)]
    : '(Sin respuesta)'
  const correctText = correctAnswer !== undefined
    ? allOptions[typeof correctAnswer === 'number' ? correctAnswer : (correctAnswer ? 0 : 1)]
    : ''

  return (
    <div className={`rounded-xl border overflow-hidden ${isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-2.5 flex items-center gap-2 text-left transition-colors ${isCorrect ? 'bg-green-500/10 hover:bg-green-500/15' : 'bg-red-500/10 hover:bg-red-500/15'}`}
      >
        {isCorrect ? <Check size={16} className="text-green-400 shrink-0" /> : <X size={16} className="text-red-400 shrink-0" />}
        <span className="text-sm font-medium text-gray-300 flex-1 truncate">
          {questionText || `Pregunta ${index + 1}`}
        </span>
        <div className="flex items-center gap-2 text-xs shrink-0">
          <Badge color={isCorrect ? 'green' : 'gray'}>
            {isCorrect ? `+${pointsEarned}` : '0'}{bonusPoints > 0 ? ` +${bonusPoints}` : ''}
          </Badge>
          <span className="text-gray-500">{timeUsed.toFixed(1)}s</span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-gray-500">▸</motion.span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-800"
          >
            <div className="px-4 py-2.5 space-y-1.5 bg-gray-900/50">
              {questionText && <p className="text-sm text-white font-medium">{questionText}</p>}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">Tu respuesta:</span>
                <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{selectedText}</span>
              </div>
              {!isCorrect && correctAnswer !== undefined && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Correcta:</span>
                  <span className="font-medium text-green-400">{correctText}</span>
                </div>
              )}
              {explanation && (
                <div className="mt-1.5 px-3 py-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
                  <p className="text-xs text-primary-300 leading-relaxed">{explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

