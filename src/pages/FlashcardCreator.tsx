import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getLocalFlashcardSets, saveFlashcardSetToLocal, saveFlashcardSetToFirestore } from '../firebase/flashcardService'
import { hasFirebaseConfig } from '../firebase/config'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FolderSelect } from '../components/ui/FolderSelect'
import { ArrowLeft, Plus, Save, Copy, CheckCheck, Trash2, Code } from 'lucide-react'
import type { Flashcard, FlashcardSet } from '../types'

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

let cardIdCounter = Date.now()

const emptyCard = (): Flashcard => ({
  id: cardIdCounter++,
  front: '',
  back: '',
})

export const FlashcardCreator = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const editSet = (location.state as { editSet?: FlashcardSet })?.editSet

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cards, setCards] = useState<Flashcard[]>([emptyCard()])
  const [visibility, setVisibility] = useState<'global' | 'private'>('private')
  const [code, setCode] = useState(generateCode())
  const [shuffleCards, setShuffleCards] = useState(false)
  const [folderId, setFolderId] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    if (editSet && !loaded) {
      setTitle(editSet.title)
      setDescription(editSet.description)
      setCards(editSet.cards.map(c => ({ ...c })))
      setVisibility(editSet.visibility || 'private')
      setCode(editSet.code || generateCode())
      setShuffleCards(editSet.shuffleCards || false)
      setFolderId(editSet.folderId || undefined)
      setLoaded(true)
    }
  }, [editSet, loaded])

  if (!user) {
    navigate('/login')
    return null
  }

  const handleCardChange = (index: number, card: Flashcard) => {
    const updated = [...cards]
    updated[index] = card
    setCards(updated)
  }

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index))
  }

  const addCard = () => {
    setCards([...cards, emptyCard()])
  }

  const handleCopyExampleJson = () => {
    const example = {
      title: 'Mi set de tarjetas',
      description: 'Descripción opcional',
      cards: [
        { front: 'Pregunta / concepto', back: 'Respuesta / definición' },
      ],
    }
    navigator.clipboard.writeText(JSON.stringify(example, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePasteJson = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const importedCards = parsed.cards || parsed.questions || []
      if (!Array.isArray(importedCards) || importedCards.length === 0) return
      const newCards = importedCards.map((c: { front?: string; back?: string; text?: string; question?: string; answer?: string; explanation?: string }) => ({
        id: cardIdCounter++,
        front: c.front || c.text || c.question || '',
        back: c.back || c.answer || c.explanation || '',
      }))
      if (parsed.title && !title.trim()) setTitle(parsed.title)
      setCards([...cards, ...newCards])
      setJsonText('')
      setShowJson(false)
    } catch {
      // invalid json
    }
  }

  const handleSave = async () => {
    if (!title.trim() || cards.some(c => !c.front.trim())) return
    setSaving(true)

    const setData: Omit<FlashcardSet, 'id'> = {
      title: title.trim(),
      description: description.trim(),
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      cards: cards.map((c, i) => ({ ...c, id: i + 1 })),
      visibility,
      code,
      shuffleCards,
      folderId,
    }

    if (hasFirebaseConfig) {
      try {
        const id = await saveFlashcardSetToFirestore({ ...setData, id: '' })
        if (id) {
          const existing = getLocalFlashcardSets().find(s => s.id === id || (code && s.code === code))
          if (existing) {
            saveFlashcardSetToLocal({ ...existing, ...setData, id: existing.id })
          } else {
            saveFlashcardSetToLocal({ ...setData, id })
          }
        }
      } catch {
        const localId = editSet?.id || `fc_${Date.now()}`
        saveFlashcardSetToLocal({ ...setData, id: localId })
      }
    } else {
      const localId = editSet?.id || `fc_${Date.now()}`
      saveFlashcardSetToLocal({ ...setData, id: localId })
    }

    setSaving(false)
    navigate('/flashcards')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/flashcards')} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{editSet ? 'Editar tarjetas' : 'Crear tarjetas'}</h1>
      </div>

      <Card className="space-y-4 p-4 sm:p-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del set"
          className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none"
        />

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Visibilidad</label>
          <div className="flex gap-3">
            <button
              onClick={() => setVisibility('private')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                visibility === 'private'
                  ? 'border-gray-500 bg-gray-800 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              Privado
            </button>
            <button
              onClick={() => setVisibility('global')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                visibility === 'global'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              Global
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">Código</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white font-mono text-sm tracking-widest uppercase focus:outline-none focus:border-primary-500"
            />
            <Button variant="secondary" size="sm" onClick={() => setCode(generateCode())}>Regenerar</Button>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <FolderSelect value={folderId} onChange={setFolderId} />
        </div>

        <div className="border-t border-gray-800 pt-4">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input type="checkbox" checked={shuffleCards} onChange={(e) => setShuffleCards(e.target.checked)} className="accent-primary-500" />
            Mezclar tarjetas al estudiar
          </label>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Tarjetas ({cards.length})</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopyExampleJson} title="Copiar ejemplo JSON">
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />} Ejemplo JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowJson(!showJson)}>
            <Code size={14} /> Pegar JSON
          </Button>
        </div>
      </div>

      {showJson && (
        <Card className="p-4 space-y-3">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`{\n  "cards": [\n    { "front": "...", "back": "..." }\n  ]\n}`}
            rows={8}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-primary-500 resize-none"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowJson(false)}>Cancelar</Button>
            <Button size="sm" onClick={handlePasteJson} disabled={!jsonText.trim()}>Importar</Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {cards.map((card, i) => (
          <Card key={card.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-400">Tarjeta {i + 1}</span>
              <button onClick={() => removeCard(i)} className="text-red-400 hover:text-red-300 text-sm">Eliminar</button>
            </div>
            <input
              type="text"
              value={card.front}
              onChange={(e) => handleCardChange(i, { ...card, front: e.target.value })}
              placeholder="Anverso (pregunta / concepto)"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
            <textarea
              value={card.back}
              onChange={(e) => handleCardChange(i, { ...card, back: e.target.value })}
              placeholder="Reverso (respuesta / definición)"
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
            />
          </Card>
        ))}
        <Button variant="secondary" onClick={addCard} className="w-full">
          <Plus size={16} /> Agregar tarjeta
        </Button>
      </div>

      <Button onClick={handleSave} disabled={saving || !title.trim()} size="lg" className="w-full">
        <Save size={18} /> {saving ? 'Guardando...' : editSet ? 'Actualizar set' : 'Guardar set'}
      </Button>
    </div>
  )
}
