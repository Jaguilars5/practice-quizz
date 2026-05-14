import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getLocalTests, saveTestToLocal, saveTestToFirestore } from '../firebase/testsService'
import { hasFirebaseConfig } from '../firebase/config'
import { QuestionEditor } from '../components/creator/QuestionEditor'
import { JsonImporter } from '../components/creator/JsonImporter'
import { JsonPasteModal } from '../components/ui/JsonPasteModal'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FolderSelect } from '../components/ui/FolderSelect'
import { importTestFromJson } from '../utils/jsonImporter'
import { ArrowLeft, Plus, Save, Globe, Lock, Shuffle, ClipboardPaste, FileDown } from 'lucide-react'
import type { Test, Question } from '../types'

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

let questionIdCounter = Date.now()

const emptyQuestion = (): Question => ({
  id: questionIdCounter++,
  text: '',
  type: 'multiple',
  options: ['', '', '', ''],
  correct: 0,
  explanation: '',
  points: 100,
  timeLimit: 20,
})

export const Creator = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const editTest = (location.state as { editTest?: Test })?.editTest

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio')
  const [timePerQuestion, setTimePerQuestion] = useState(20)
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()])
  const [visibility, setVisibility] = useState<'global' | 'private'>('private')
  const [code, setCode] = useState(generateCode())
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(4)
  const [folderId, setFolderId] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)

  useEffect(() => {
    if (editTest && !loaded) {
      setTitle(editTest.title)
      setDescription(editTest.description)
      setCategory(editTest.category)
      setDifficulty(editTest.difficulty)
      setTimePerQuestion(editTest.timePerQuestion)
      setQuestions(editTest.questions.map(q => ({ ...q })))
      setVisibility(editTest.visibility || 'private')
      setCode(editTest.code || generateCode())
      setShuffleQuestions(editTest.shuffleQuestions || false)
      setShuffleOptions(editTest.shuffleOptions || false)
      setAutoAdvance(editTest.autoAdvance ?? 4)
      setFolderId(editTest.folderId || undefined)
      setLoaded(true)
    }
  }, [editTest, loaded])

  if (!user) {
    navigate('/login')
    return null
  }

  const handleQuestionChange = (index: number, q: Question) => {
    const updated = [...questions]
    updated[index] = q
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addQuestion = () => {
    setQuestions([...questions, emptyQuestion()])
  }

  const handleImport = (test: Test) => {
    setTitle(test.title)
    setDescription(test.description)
    setCategory(test.category)
    setDifficulty(test.difficulty)
    setTimePerQuestion(test.timePerQuestion)
    setQuestions(test.questions.map(q => ({ ...q, id: questionIdCounter++ })))
    setVisibility(test.visibility || 'private')
    setCode(test.code || generateCode())
    setShuffleQuestions(test.shuffleQuestions || false)
    setShuffleOptions(test.shuffleOptions || false)
    setAutoAdvance(test.autoAdvance ?? 4)
    setLoaded(true)
  }

  const handlePasteImport = (test: Test) => {
    // Same as file import: replace current test with pasted data
    handleImport(test)
  }

  const handleImportQuestions = async () => {
    try {
      const test = await importTestFromJson()
      const newQuestions = test.questions.map(q => ({ ...q, id: questionIdCounter++ }))
      if (newQuestions.length === 0) return
      if (!title.trim() && test.title) setTitle(test.title)
      setQuestions([...questions, ...newQuestions])
    } catch {
      // user cancelled or error
    }
  }

  const handleSave = async () => {
    if (!title.trim() || questions.some((q) => !q.text.trim())) return
    setSaving(true)

    const testData: Omit<Test, 'id'> = {
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      timePerQuestion,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      questions: questions.map((q, i) => ({ ...q, id: i + 1 })),
      visibility,
      code,
      shuffleQuestions,
      shuffleOptions,
      autoAdvance,
      folderId,
    }

    if (hasFirebaseConfig) {
      try {
        const id = await saveTestToFirestore({ ...testData, id: '' })
        if (id) {
          const existing = getLocalTests().find(t => t.id === id || (code && t.code === code))
          if (existing) {
            const updated: Test = { ...existing, ...testData, id: existing.id }
            saveTestToLocal(updated)
          } else {
            saveTestToLocal({ ...testData, id })
          }
        }
      } catch {
        const localId = editTest?.id || `test_${Date.now()}`
        saveTestToLocal({ ...testData, id: localId })
      }
    } else {
      const localId = editTest?.id || `test_${Date.now()}`
      saveTestToLocal({ ...testData, id: localId })
    }

    setSaving(false)
    navigate('/')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <JsonPasteModal isOpen={showPasteModal} onClose={() => setShowPasteModal(false)} onImport={handlePasteImport} />

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{editTest ? 'Editar test' : 'Crear test'}</h1>
        <div className="ml-auto flex gap-1 sm:gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowPasteModal(true)} className="text-xs px-2 sm:px-3">
            <ClipboardPaste size={14} /> <span className="hidden sm:inline">Pegar JSON</span>
          </Button>
          <span className="sm:inline"><JsonImporter onImport={handleImport} /></span>
        </div>
      </div>

      <Card className="space-y-4 p-4 sm:p-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del test"
          className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 focus:outline-none"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full bg-transparent text-gray-400 placeholder-gray-600 focus:outline-none"
        />
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-xs text-gray-500">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm mt-1 focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Dificultad</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'facil' | 'medio' | 'dificil')}
              className="block bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm mt-1 focus:outline-none focus:border-primary-500"
            >
              <option value="facil">Fácil</option>
              <option value="medio">Medio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Tiempo por pregunta (s)</label>
            <input
              type="number"
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              className="block bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm mt-1 w-20 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Visibilidad</label>
          <div className="flex gap-3">
            <button
              onClick={() => setVisibility('private')}
              className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                visibility === 'private'
                  ? 'border-gray-500 bg-gray-800 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <Lock size={16} />
              Privado (solo tú)
            </button>
            <button
              onClick={() => setVisibility('global')}
              className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                visibility === 'global'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <Globe size={16} />
              Global (todos acceden)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Código del test</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-lg tracking-widest uppercase focus:outline-none focus:border-primary-500"
                />
                <Button variant="secondary" size="sm" onClick={() => setCode(generateCode())}>
                  Regenerar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <FolderSelect value={folderId} onChange={setFolderId} />
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Aleatorizar</label>
          <div className="flex gap-3">
            <button
              onClick={() => setShuffleQuestions(!shuffleQuestions)}
              className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                shuffleQuestions
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <Shuffle size={16} />
              Preguntas al azar
            </button>
            <button
              onClick={() => setShuffleOptions(!shuffleOptions)}
              className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                shuffleOptions
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <Shuffle size={16} />
              Opciones al azar
            </button>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Auto-avance</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={autoAdvance}
              onChange={(e) => setAutoAdvance(Number(e.target.value))}
              className="flex-1 accent-primary-500"
            />
            <span className="text-sm text-white font-mono w-16 text-right">
              {autoAdvance === 0 ? 'Manual' : `${autoAdvance}s`}
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Preguntas ({questions.length})</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleImportQuestions}>
              <FileDown size={14} /> Importar preguntas
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPasteModal(true)}>
              <ClipboardPaste size={14} /> Pegar preguntas
            </Button>
          </div>
        </div>
        {questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={i}
            onChange={handleQuestionChange}
            onRemove={removeQuestion}
          />
        ))}
        <Button variant="secondary" onClick={addQuestion} className="w-full">
          <Plus size={16} /> Agregar pregunta
        </Button>
      </div>

      <Button onClick={handleSave} disabled={saving || !title.trim()} size="lg" className="w-full">
        <Save size={18} /> {saving ? 'Guardando...' : editTest ? 'Actualizar test' : 'Guardar test'}
      </Button>
    </div>
  )
}
