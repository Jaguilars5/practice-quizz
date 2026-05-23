import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

interface JsonPasteModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (test: import('../../types').Test) => void
}

export const JsonPasteModal = ({ isOpen, onClose, onImport }: JsonPasteModalProps) => {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const handleImport = () => {
    setError('')
    try {
      const parsed = JSON.parse(text)
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        setError('El JSON debe tener un campo "questions" con un array')
        return
      }
      onImport(parsed)
      setText('')
      onClose()
    } catch {
      setError('JSON inválido. Revisá el formato.')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pegar JSON">
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setError('') }}
          placeholder={`{\n  "title": "Mi test",\n  "questions": [...]\n}`}
          rows={10}
          className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-primary-500 resize-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleImport} disabled={!text.trim()}>Importar</Button>
        </div>
      </div>
    </Modal>
  )
}

