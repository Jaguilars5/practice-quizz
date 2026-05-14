import { useState } from 'react'
import { Folder, Plus, Edit3, Trash2, Check, X } from 'lucide-react'

interface FolderItemProps {
  name: string
  count: number
  isActive: boolean
  onSelect: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

const FolderItem = ({ name, count, isActive, onSelect, onRename, onDelete }: FolderItemProps) => {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)

  const handleRename = () => {
    if (editValue.trim()) onRename(editValue.trim())
    setEditing(false)
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group ${
        isActive ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }`}
      onClick={!editing ? onSelect : undefined}
    >
      <Folder size={16} />
      {editing ? (
        <div className="flex-1 flex gap-1">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
            autoFocus
          />
          <button onClick={handleRename} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
          <button onClick={() => setEditing(false)} className="text-red-400 hover:text-red-300"><X size={14} /></button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium truncate">{name}</span>
          <span className="text-xs text-gray-500">{count}</span>
          <div className="hidden group-hover:flex gap-0.5">
            <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditValue(name) }} className="p-1 hover:text-white"><Edit3 size={12} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 hover:text-red-400"><Trash2 size={12} /></button>
          </div>
        </>
      )}
    </div>
  )
}

interface FolderListProps {
  folders: { id: string; name: string; count: number }[]
  activeFolder: string | null
  onSelectFolder: (id: string | null) => void
  onRenameFolder: (id: string, name: string) => void
  onDeleteFolder: (id: string) => void
  onNewFolder: () => void
}

export const FolderList = ({ folders, activeFolder, onSelectFolder, onRenameFolder, onDeleteFolder, onNewFolder }: FolderListProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Carpetas</span>
        <button onClick={onNewFolder} className="text-gray-400 hover:text-white transition-colors p-1" title="Nueva carpeta">
          <Plus size={14} />
        </button>
      </div>
      <FolderItem
        name="Todos"
        count={folders.reduce((s, f) => s + f.count, 0)}
        isActive={activeFolder === null}
        onSelect={() => onSelectFolder(null)}
        onRename={() => {}}
        onDelete={() => {}}
      />
      {folders.map(f => (
        <FolderItem
          key={f.id}
          name={f.name}
          count={f.count}
          isActive={activeFolder === f.id}
          onSelect={() => onSelectFolder(f.id)}
          onRename={(name) => onRenameFolder(f.id, name)}
          onDelete={() => onDeleteFolder(f.id)}
        />
      ))}
    </div>
  )
}
