import type { FlashcardSet } from '../../types'
import { Card } from '../ui/Card'
import { Play, Edit3, Trash2, Globe, Lock, Copy } from 'lucide-react'

interface FlashcardCardProps {
  set: FlashcardSet
  onStudy: () => void
  onEdit?: () => void
  onDelete?: () => void
  showCode?: boolean
}

export const FlashcardCard = ({ set, onStudy, onEdit, onDelete, showCode }: FlashcardCardProps) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(set.code)
  }

  return (
    <Card className="group relative">
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white">{set.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{set.description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{set.cards.length} tarjetas</span>
        </div>

        {showCode && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg">
            {set.visibility === 'global' ? <Globe size={14} className="text-primary-400" /> : <Lock size={14} className="text-gray-500" />}
            <span className="text-xs text-gray-400">Código:</span>
            <span className="font-mono font-bold text-white tracking-widest">{set.code}</span>
            <button onClick={handleCopyCode} className="ml-auto text-gray-500 hover:text-white transition-colors" title="Copiar código">
              <Copy size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onStudy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl text-white font-semibold text-sm transition-all"
          >
            <Play size={16} /> Estudiar
          </button>
          {onEdit && (
            <button onClick={onEdit} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 transition-all">
              <Edit3 size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-2 bg-gray-800 hover:bg-red-600/20 rounded-xl text-gray-300 hover:text-red-400 transition-all">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
