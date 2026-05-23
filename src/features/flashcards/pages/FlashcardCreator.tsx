import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import { useAuthStore } from '@authState/useAuthStore'
import { getLocalFlashcardSets, saveFlashcardSetToLocal, saveFlashcardSetToFirestore } from '@flashcardData'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { logError } from '@app/services/errorLogger'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { FolderSelect } from '@folders/components/FolderSelect'
import { flashcardSetSchema, mapFlashcardSetToFormValues, type FlashcardSetFormValues } from '../schemas/flashcardSchema'
import { ArrowLeft, Plus, Save, Copy, CheckCheck, Code } from 'lucide-react'
import type { Flashcard, FlashcardSet } from '@shared/types'

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

  const [cards, setCards] = useState<Flashcard[]>(editSet?.cards.map(c => ({ ...c })) || [emptyCard()])
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [showJson, setShowJson] = useState(false)

  const formik = useFormik<FlashcardSetFormValues>({
    initialValues: mapFlashcardSetToFormValues(editSet),
    validationSchema: flashcardSetSchema,
    onSubmit: async (values) => {
      if (!user || cards.some(c => !c.front.trim())) return
      setSaving(true)

      const setData: Omit<FlashcardSet, 'id'> = {
        ...values,
        code: values.code || '',
        description: values.description || '',
        folderId: values.folderId || undefined,
        createdBy: user.email,
        createdAt: editSet?.createdAt || new Date().toISOString(),
        cards: cards.map((c, i) => ({ ...c, id: i + 1 })),
      }

      if (hasFirebaseConfig) {
        try {
          const id = await saveFlashcardSetToFirestore({ ...setData, id: '' })
          if (id) {
            const existing = getLocalFlashcardSets().find(s => s.id === id || (values.code && s.code === values.code))
            if (existing) {
              saveFlashcardSetToLocal({ ...existing, ...setData, id: existing.id })
            } else {
              saveFlashcardSetToLocal({ ...setData, id })
            }
          }
        } catch (error) {
          logError(error, 'FlashcardCreator:handleSave')
          const localId = editSet?.id || `fc_${Date.now()}`
          saveFlashcardSetToLocal({ ...setData, id: localId })
        }
      } else {
        const localId = editSet?.id || `fc_${Date.now()}`
        saveFlashcardSetToLocal({ ...setData, id: localId })
      }

      setSaving(false)
      navigate('/flashcards')
    },
  })

  const handleCardChange = useCallback((index: number, card: Flashcard) => {
    setCards(prev => {
      const updated = [...prev]
      updated[index] = card
      return updated
    })
  }, [])

  const removeCard = useCallback((index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index))
  }, [])

  const addCard = useCallback(() => {
    setCards(prev => [...prev, emptyCard()])
  }, [])

  const handleCopyExampleJson = useCallback(() => {
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
  }, [])

  const handlePasteJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText)
      const importedCards = parsed.cards || parsed.questions || []
      if (!Array.isArray(importedCards) || importedCards.length === 0) return
      const newCards = importedCards.map((c: { front?: string; back?: string; text?: string; question?: string; answer?: string; explanation?: string }) => ({
        id: cardIdCounter++,
        front: c.front || c.text || c.question || '',
        back: c.back || c.answer || c.explanation || '',
      }))
      if (parsed.title && !formik.values.title.trim()) formik.setFieldValue('title', parsed.title)
      setCards(prev => [...prev, ...newCards])
      setJsonText('')
      setShowJson(false)
    } catch {
      // invalid json
    }
  }, [jsonText, formik])

  const regenerateCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    formik.setFieldValue('code', code)
  }, [formik])

  if (!user) {
    navigate('/login')
    return null
  }

  const errorText = (field: string) => formik.touched[field as keyof typeof formik.touched] && formik.errors[field as keyof typeof formik.errors] ? formik.errors[field as keyof typeof formik.errors] : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <form onSubmit={formik.handleSubmit}>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" onClick={() => navigate('/flashcards')} className="shrink-0">
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{editSet ? 'Editar tarjetas' : 'Crear tarjetas'}</h1>
        </div>

        <Card className="space-y-4 p-4 sm:p-6 mt-4">
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Título del set"
            className={`w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none ${formik.touched.title && formik.errors.title ? 'border-b-2 border-red-500' : ''}`}
          />
          {errorText('title') && <p className="text-xs text-red-400">{errorText('title')}</p>}
          <input
            type="text"
            name="description"
            value={formik.values.description || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Descripción (opcional)"
            className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none"
          />

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Visibilidad</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => formik.setFieldValue('visibility', 'private')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formik.values.visibility === 'private'
                    ? 'border-gray-500 bg-gray-800 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                Privado
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue('visibility', 'global')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formik.values.visibility === 'global'
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
                name="code"
                value={formik.values.code}
                onChange={(e) => formik.setFieldValue('code', e.target.value.toUpperCase())}
                onBlur={formik.handleBlur}
                maxLength={6}
                className={`flex-1 bg-gray-800 border rounded-lg px-3 py-1.5 text-white font-mono text-sm tracking-widest uppercase focus:outline-none ${errorText('code') ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-primary-500'}`}
              />
              <Button type="button" variant="secondary" size="sm" onClick={regenerateCode}>Regenerar</Button>
            </div>
            {errorText('code') && <p className="text-xs text-red-400">{errorText('code')}</p>}
          </div>

          <div className="border-t border-gray-800 pt-4">
            <FolderSelect value={formik.values.folderId || undefined} onChange={(id) => formik.setFieldValue('folderId', id)} />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                name="shuffleCards"
                checked={formik.values.shuffleCards}
                onChange={(e) => formik.setFieldValue('shuffleCards', e.target.checked)}
                className="accent-primary-500"
              />
              Mezclar tarjetas al estudiar
            </label>
          </div>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <h2 className="text-lg font-bold text-white">Tarjetas ({cards.length})</h2>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCopyExampleJson} title="Copiar ejemplo JSON">
              {copied ? <CheckCheck size={14} /> : <Copy size={14} />} Ejemplo JSON
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowJson(!showJson)}>
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
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowJson(false)}>Cancelar</Button>
              <Button type="button" size="sm" onClick={handlePasteJson} disabled={!jsonText.trim()}>Importar</Button>
            </div>
          </Card>
        )}

        <div className="space-y-4 mt-6">
          {cards.map((card, i) => (
            <Card key={card.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary-400">Tarjeta {i + 1}</span>
                <button type="button" onClick={() => removeCard(i)} className="text-red-400 hover:text-red-300 text-sm">Eliminar</button>
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
          <Button type="button" variant="secondary" onClick={addCard} className="w-full">
            <Plus size={16} /> Agregar tarjeta
          </Button>
        </div>

        <Button type="submit" disabled={saving || !formik.values.title.trim()} size="lg" className="w-full mt-6">
          <Save size={18} /> {saving ? 'Guardando...' : editSet ? 'Actualizar set' : 'Guardar set'}
        </Button>
      </form>
    </div>
  )
}
