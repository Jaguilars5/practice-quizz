import { useNavigate, useLocation } from 'react-router-dom'
import { useFormik } from 'formik'
import { useAuthStore } from '@authState/useAuthStore'
import { QuestionEditor } from '../components/QuestionEditor'
import { JsonImporter } from '../components/JsonImporter'
import { JsonPasteModal } from '@shared/components/ui/JsonPasteModal'
import { JsonEditorModal } from '@shared/components/ui/JsonEditorModal'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { FolderSelect } from '@folders/components/FolderSelect'
import { useQuestionManager } from '../hooks/useQuestionManager'
import { testSchema, mapTestToFormValues, type TestFormValues } from '../schemas/testSchema'
import { getLocalTests, saveTestToLocal, saveTestToFirestore } from '@quizData'
import { exportTestAsJson } from '@shared/utils/jsonExporter'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { logError } from '@app/services/errorLogger'
import { ArrowLeft, Plus, Save, Globe, Lock, Shuffle, ClipboardPaste, FileDown, Code, Copy, CheckCheck } from 'lucide-react'
import type { Test } from '@shared/types'
import { useState, useCallback } from 'react'

export const Creator = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const editTest = (location.state as { editTest?: Test })?.editTest

  const [showPasteModal, setShowPasteModal] = useState(false)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const [exampleCopied, setExampleCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  const questionManager = useQuestionManager(editTest?.questions)
  const { questions, handleQuestionChange, removeQuestion, addQuestion, setQuestions, handleImportQuestions } = questionManager

  const formik = useFormik<TestFormValues>({
    initialValues: mapTestToFormValues(editTest),
    validationSchema: testSchema,
    onSubmit: async (values) => {
      if (!user || questions.some((q) => !q.text.trim())) return
      setSaving(true)

      const testData: Omit<Test, 'id'> = {
        ...values,
        code: values.code || '',
        description: values.description || '',
        category: values.category || '',
        folderId: values.folderId || undefined,
        createdBy: user.email,
        createdAt: editTest?.createdAt || new Date().toISOString(),
        questions: questions.map((q, i) => ({ ...q, id: i + 1 })),
      }

      if (hasFirebaseConfig) {
        try {
          const id = await saveTestToFirestore({ ...testData, id: '' })
          if (id) {
            const existing = getLocalTests().find(t => t.id === id || (values.code && t.code === values.code))
            if (existing) {
              saveTestToLocal({ ...existing, ...testData, id: existing.id })
            } else {
              saveTestToLocal({ ...testData, id })
            }
          }
        } catch (error) {
          logError(error, 'Creator:handleSave')
          const localId = editTest?.id || `test_${Date.now()}`
          saveTestToLocal({ ...testData, id: localId })
        }
      } else {
        const localId = editTest?.id || `test_${Date.now()}`
        saveTestToLocal({ ...testData, id: localId })
      }

      setSaving(false)
      navigate('/')
    },
  })

  const handleImport = useCallback((test: Test) => {
    formik.setValues(mapTestToFormValues(test))
    setQuestions(test.questions.map(q => ({ ...q, id: Date.now() + Math.random() })))
  }, [formik, setQuestions])

  const handlePasteImport = useCallback((test: Test) => {
    handleImport(test)
  }, [handleImport])

  const handleJsonApply = useCallback((test: Omit<Test, 'id'>) => {
    formik.setValues(mapTestToFormValues(test as Test))
    setQuestions(test.questions.map(q => ({ ...q, id: Date.now() + Math.random() })))
  }, [formik, setQuestions])

  const handleExportJson = useCallback(() => {
    const test: Test = {
      id: editTest?.id || `test_${Date.now()}`,
      ...formik.values,
      code: formik.values.code || '',
      description: formik.values.description || '',
      category: formik.values.category || '',
      folderId: formik.values.folderId || undefined,
      createdBy: user!.email,
      createdAt: editTest?.createdAt || new Date().toISOString(),
      questions: questions.map((q, i) => ({ ...q, id: i + 1 })),
    }
    exportTestAsJson(test)
  }, [formik.values, questions, editTest, user])

  const handleCopyExampleJson = useCallback(() => {
    const example = {
      title: 'Mi test',
      description: 'Descripción opcional',
      category: 'General',
      difficulty: 'medio',
      timePerQuestion: 20,
      visibility: 'private',
      code: 'ABC123',
      questions: [
        {
          text: '¿En qué año...?',
          type: 'multiple',
          options: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
          correct: 0,
          explanation: 'Explicación opcional',
          points: 100,
          timeLimit: 20,
        },
      ],
    }
    navigator.clipboard.writeText(JSON.stringify(example, null, 2))
    setExampleCopied(true)
    setTimeout(() => setExampleCopied(false), 2000)
  }, [])

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

  const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm mt-1 focus:outline-none focus:border-primary-500"
  const inputErrorClass = "w-full bg-gray-800 border border-red-500 rounded-lg px-3 py-1.5 text-white text-sm mt-1 focus:outline-none focus:border-red-400"
  const errorText = (field: string) => formik.touched[field as keyof typeof formik.touched] && formik.errors[field as keyof typeof formik.errors] ? formik.errors[field as keyof typeof formik.errors] : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <JsonPasteModal isOpen={showPasteModal} onClose={() => setShowPasteModal(false)} onImport={handlePasteImport} />
      <JsonEditorModal isOpen={showJsonEditor} onClose={() => setShowJsonEditor(false)} testData={{
        title: formik.values.title,
        description: formik.values.description || '',
        category: formik.values.category || '',
        difficulty: formik.values.difficulty,
        timePerQuestion: formik.values.timePerQuestion,
        createdBy: user.email,
        createdAt: new Date().toISOString(),
        questions,
        visibility: formik.values.visibility,
        code: formik.values.code || '',
        shuffleQuestions: formik.values.shuffleQuestions,
        shuffleOptions: formik.values.shuffleOptions,
        autoAdvance: formik.values.autoAdvance,
        folderId: formik.values.folderId || undefined,
      }} onApply={handleJsonApply} />

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="shrink-0">
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{editTest ? 'Editar test' : 'Crear test'}</h1>
        <div className="ml-auto flex gap-1 sm:gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportJson} className="text-xs px-2 sm:px-3">
            <FileDown size={14} /> <span className="hidden sm:inline">Exportar JSON</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowPasteModal(true)} className="text-xs px-2 sm:px-3">
            <ClipboardPaste size={14} /> <span className="hidden sm:inline">Pegar JSON</span>
          </Button>
          <span className="sm:inline"><JsonImporter onImport={handleImport} /></span>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <Card className="space-y-4 p-4 sm:p-6">
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Título del test"
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
          {errorText('description') && <p className="text-xs text-red-400">{errorText('description')}</p>}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs text-gray-500">Categoría</label>
              <input
                type="text"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={errorText('category') ? inputErrorClass : inputClass}
              />
              {errorText('category') && <p className="text-xs text-red-400 mt-1">{errorText('category')}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500">Dificultad</label>
              <select
                name="difficulty"
                value={formik.values.difficulty}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClass}
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
                name="timePerQuestion"
                value={formik.values.timePerQuestion}
                onChange={(e) => {
                  const newTime = Number(e.target.value)
                  formik.setFieldValue('timePerQuestion', newTime)
                  setQuestions(questions.map(q => ({ ...q, timeLimit: newTime })))
                }}
                className={`${inputClass} w-20`}
              />
              {errorText('timePerQuestion') && <p className="text-xs text-red-400 mt-1">{errorText('timePerQuestion')}</p>}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Visibilidad</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => formik.setFieldValue('visibility', 'private')}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formik.values.visibility === 'private'
                    ? 'border-gray-500 bg-gray-800 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Lock size={16} />
                Privado (solo tú)
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue('visibility', 'global')}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formik.values.visibility === 'global'
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
                    name="code"
                    value={formik.values.code}
                    onChange={(e) => formik.setFieldValue('code', e.target.value.toUpperCase())}
                    onBlur={formik.handleBlur}
                    maxLength={6}
                    className={`flex-1 bg-gray-800 border rounded-lg px-4 py-2 text-white font-mono text-lg tracking-widest uppercase focus:outline-none ${errorText('code') ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-primary-500'}`}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={regenerateCode}>
                    Regenerar
                  </Button>
                </div>
                {errorText('code') && <p className="text-xs text-red-400 mt-1">{errorText('code')}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <FolderSelect value={formik.values.folderId || undefined} onChange={(id) => formik.setFieldValue('folderId', id)} />
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Aleatorizar</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => formik.setFieldValue('shuffleQuestions', !formik.values.shuffleQuestions)}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formik.values.shuffleQuestions
                    ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Shuffle size={16} />
                Preguntas al azar
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue('shuffleOptions', !formik.values.shuffleOptions)}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  formik.values.shuffleOptions
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
                name="autoAdvance"
                min={0}
                max={10}
                step={1}
                value={formik.values.autoAdvance}
                onChange={(e) => formik.setFieldValue('autoAdvance', Number(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <span className="text-sm text-white font-mono w-16 text-right">
                {formik.values.autoAdvance === 0 ? 'Manual' : `${formik.values.autoAdvance}s`}
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Preguntas ({questions.length})</h2>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleCopyExampleJson} title="Copiar ejemplo de formato JSON">
                {exampleCopied ? <CheckCheck size={14} /> : <Copy size={14} />} Ejemplo JSON
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowJsonEditor(true)}>
                <Code size={14} /> Editar JSON
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleImportQuestions()}>
                <FileDown size={14} /> Importar preguntas
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPasteModal(true)}>
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
          <Button type="button" variant="secondary" onClick={addQuestion} className="w-full">
            <Plus size={16} /> Agregar pregunta
          </Button>
        </div>

        <Button type="submit" disabled={saving || !formik.values.title.trim()} size="lg" className="w-full mt-6">
          <Save size={18} /> {saving ? 'Guardando...' : editTest ? 'Actualizar test' : 'Guardar test'}
        </Button>
      </form>
    </div>
  )
}
