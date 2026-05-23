import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { getLocalFlashcardSets, getFlashcardSetById, saveFlashcardSetToLocal } from '../firebase/flashcardService'
import { hasFirebaseConfig } from '../firebase/config'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ArrowLeft, Shuffle, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import type { FlashcardSet, Flashcard } from '../types'

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const FlashcardStudy = () => {
  const { setId } = useParams<{ setId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [set, setSetState] = useState<FlashcardSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<Flashcard[] | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    const load = async () => {
      setLoading(true)
      let found: FlashcardSet | null = null

      const local = getLocalFlashcardSets()
      found = local.find(s => s.id === setId) || null

      if (!found && hasFirebaseConfig) {
        try {
          found = await getFlashcardSetById(setId!)
          if (found) saveFlashcardSetToLocal(found)
        } catch { /* fallback */ }
      }

      if (found) {
        setSetState(found)
        setShuffledCards(found.shuffleCards ? shuffle(found.cards) : null)
      }
      setLoading(false)
    }
    load()
  }, [setId, user, navigate])

  const cards = shuffledCards || set?.cards || []
  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0

  const goNext = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setFlipped(false)
    if (set?.shuffleCards) setShuffledCards(shuffle(set.cards))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!set || cards.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        Set no encontrado
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/flashcards')} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white truncate">{set.title}</h1>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <button onClick={goPrev} disabled={currentIndex === 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={24} />
        </button>
        <span className="text-sm text-gray-400 font-mono">{currentIndex + 1} / {cards.length}</span>
        <button onClick={goNext} disabled={currentIndex + 1 >= cards.length} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronRight size={24} />
        </button>
      </div>

      <motion.div
        key={currentIndex + (flipped ? '-flipped' : '')}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <div
          onClick={() => setFlipped(!flipped)}
          className="cursor-pointer"
        >
          <Card className="p-8 sm:p-12 min-h-[280px] flex items-center justify-center">
            {flipped ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-xs text-gray-500 mb-4">REVERSO</p>
                <p className="text-lg sm:text-xl text-white whitespace-pre-wrap">{currentCard.back}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-xs text-gray-500 mb-4">ANVERSO</p>
                <p className="text-lg sm:text-xl text-white font-semibold whitespace-pre-wrap">{currentCard.front}</p>
              </motion.div>
            )}
          </Card>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">Hacé clic en la tarjeta para dar vuelta</p>
      </motion.div>

      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={handleRestart}>
          <RotateCcw size={16} /> Reiniciar
        </Button>
        {set.shuffleCards && shuffledCards && (
          <Button variant="secondary" onClick={() => setShuffledCards(shuffle(set.cards))}>
            <Shuffle size={16} /> Mezclar
          </Button>
        )}
      </div>
    </div>
  )
}
