import { getLocalFolders } from '@folders/services/folders.api'
import { Folder } from 'lucide-react'

interface FolderSelectProps {
  value?: string
  onChange: (folderId: string | undefined) => void
}

export const FolderSelect = ({ value, onChange }: FolderSelectProps) => {
  const folders = getLocalFolders()

  return (
    <div>
      <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Carpeta</label>
      <div className="flex gap-2 mt-1">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
        >
          <option value="">Sin carpeta</option>
          {folders.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <div className="flex items-center text-gray-500"><Folder size={16} /></div>
      </div>
    </div>
  )
}
