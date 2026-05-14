import { importTestFromJson } from '../../utils/jsonImporter'
import { Button } from '../ui/Button'
import { Upload } from 'lucide-react'

interface JsonImporterProps {
  onImport: (test: import('../../types').Test) => void
}

export const JsonImporter = ({ onImport }: JsonImporterProps) => {
  const handleImport = async () => {
    try {
      const test = await importTestFromJson()
      onImport(test)
    } catch {
      // user cancelled or error
    }
  }

  return (
    <Button variant="secondary" onClick={handleImport}>
      <Upload size={16} /> Importar JSON
    </Button>
  )
}
