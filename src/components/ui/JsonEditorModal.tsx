import { useEffect, useState, useCallback } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import type { Test } from '../../types'

interface JsonEditorModalProps {
  isOpen: boolean
  onClose: () => void
  testData: Omit<Test, 'id'>
  onApply: (test: Omit<Test, 'id'>) => void
}

const stripImmutable = (data: Omit<Test, 'id'>): Omit<Test, 'id'> => {
  const { createdBy, createdAt, ...rest } = data
  return rest
}

export const JsonEditorModal = ({ isOpen, onClose, testData, onApply }: JsonEditorModalProps) => {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setText(JSON.stringify(stripImmutable(testData), null, 2))
      setError('')
    }
  }, [isOpen, testData])

  const handleApply = () => {
    setError('')
    try {
      const parsed = JSON.parse(text)
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        setError('El JSON debe tener un campo "questions" con un array')
        return
      }
      const { createdBy, createdAt, ...clean } = parsed
      onApply(clean)
      onClose()
    } catch {
      setError('JSON inválido. Revisá el formato.')
    }
  }

  const handleExport = useCallback(() => {
    try {
      JSON.parse(text)
    } catch {
      setError('El JSON tiene errores. Corregilos antes de exportar.')
      return
    }
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test_exportado.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [text])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar JSON">
      <div className="space-y-4">
        <p className="text-xs text-gray-500">Los campos <code>createdBy</code> y <code>createdAt</code> se asignan automáticamente y se omiten del editor.</p>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError('') }}
          rows={20}
          className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-primary-500 resize-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 justify-between">
          <Button variant="secondary" onClick={handleExport} disabled={!text.trim()}>
            Exportar JSON
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleApply} disabled={!text.trim()}>Aplicar cambios</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
