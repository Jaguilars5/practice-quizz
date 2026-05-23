import { useState } from 'react'
import { Folder, Plus, Edit3, Trash2, Check, X, Globe, Lock, KeyRound, Copy, CheckCheck } from 'lucide-react'
import type { Folder as FolderType } from '../../types'

const visibilityIcon = (v: FolderType['visibility']) => {
  switch (v) {
    case 'public': return <Globe size={12} className="text-green-400" />
    case 'code': return <KeyRound size={12} className="text-yellow-400" />
    default: return <Lock size={12} className="text-gray-500" />
  }
}

const visibilityLabel = (v: FolderType['visibility']) => {
  switch (v) {
    case 'public': return 'Público'
    case 'code': return 'Código'
    default: return 'Privado'
  }
}

interface FolderItemProps {
  id: string
  name: string
  count: number
  visibility: FolderType['visibility']
  code?: string
  createdBy: string
  isActive: boolean
  isOwn: boolean
  onSelect: () => void
  onRename: (name: string) => void
  onDelete: () => void
  onUpdateVisibility: (visibility: FolderType['visibility'], code?: string) => void
}

const FolderItem = ({ id, name, count, visibility, code, createdBy, isActive, isOwn, onSelect, onRename, onDelete, onUpdateVisibility }: FolderItemProps) => {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)
  const [showVisMenu, setShowVisMenu] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const handleRename = () => {
    if (editValue.trim()) onRename(editValue.trim())
    setEditing(false)
  }

  const handleCopyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group relative ${
        isActive ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }`}
      onClick={!editing ? onSelect : undefined}
    >
      <Folder size={16} />
      {editing ? (
        <div className="flex-1 flex gap-0.5 min-w-0">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-sm text-white focus:outline-none"
            autoFocus
          />
          <button onClick={handleRename} className="p-1 text-green-400 hover:text-green-300 shrink-0"><Check size={14} /></button>
          <button onClick={() => setEditing(false)} className="p-1 text-red-400 hover:text-red-300 shrink-0"><X size={14} /></button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium truncate">{name}</span>
          <span className="text-xs text-gray-500">{count}</span>
          <span className="shrink-0">{visibilityIcon(visibility)}</span>
          {isOwn && (
            <div className="hidden group-hover:flex gap-0.5">
              <button onClick={(e) => { e.stopPropagation(); setShowVisMenu(!showVisMenu) }} className="p-1 hover:text-white text-xs" title={visibilityLabel(visibility)}>
                {visibility === 'public' ? <Globe size={12} /> : visibility === 'code' ? <KeyRound size={12} /> : <Lock size={12} />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); setEditValue(name) }} className="p-1 hover:text-white"><Edit3 size={12} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 hover:text-red-400"><Trash2 size={12} /></button>
            </div>
          )}
          {visibility === 'code' && code && (
            <button onClick={(e) => { e.stopPropagation(); handleCopyCode() }} className="text-xs font-mono tracking-wider text-yellow-400/70 hover:text-yellow-300 flex items-center gap-1" title="Copiar código">
              {codeCopied ? <CheckCheck size={12} /> : <Copy size={12} />}
              {code}
            </button>
          )}
        </>
      )}

      {showVisMenu && isOwn && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="text-xs text-gray-400 mb-1 px-1">Visibilidad</div>
          {(['private', 'public', 'code'] as const).map(v => (
            <button
              key={v}
              onClick={() => {
                if (v === 'code') {
                  const folderCode = code || Math.random().toString(36).substring(2, 8).toUpperCase()
                  onUpdateVisibility(v, folderCode)
                } else {
                  onUpdateVisibility(v)
                }
                setShowVisMenu(false)
              }}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm transition-all ${
                visibility === v ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {v === 'public' ? <Globe size={14} /> : v === 'code' ? <KeyRound size={14} /> : <Lock size={14} />}
              {v === 'public' ? 'Público' : v === 'code' ? 'Por código' : 'Privado'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface FolderListProps {
  folders: (FolderType & { count: number })[]
  activeFolder: string | null
  currentUserEmail: string
  onSelectFolder: (id: string | null) => void
  onRenameFolder: (id: string, name: string) => void
  onDeleteFolder: (id: string) => void
  onUpdateVisibility: (id: string, visibility: FolderType['visibility'], code?: string) => void
  onNewFolder: () => void
}

export const FolderList = ({ folders, activeFolder, currentUserEmail, onSelectFolder, onRenameFolder, onDeleteFolder, onUpdateVisibility, onNewFolder }: FolderListProps) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Carpetas</span>
        <button onClick={onNewFolder} className="text-gray-400 hover:text-white transition-colors p-1" title="Nueva carpeta">
          <Plus size={14} />
        </button>
      </div>
      <FolderItem
        id="__all"
        name="Todos"
        count={folders.reduce((s, f) => s + f.count, 0)}
        visibility="private"
        createdBy=""
        isActive={activeFolder === null}
        isOwn={false}
        onSelect={() => onSelectFolder(null)}
        onRename={() => {}}
        onDelete={() => {}}
        onUpdateVisibility={() => {}}
      />
      {folders.map(f => (
        <FolderItem
          key={f.id}
          id={f.id}
          name={f.name}
          count={f.count}
          visibility={f.visibility}
          code={f.code}
          createdBy={f.createdBy}
          isActive={activeFolder === f.id}
          isOwn={f.createdBy === currentUserEmail}
          onSelect={() => onSelectFolder(f.id)}
          onRename={(name) => onRenameFolder(f.id, name)}
          onDelete={() => onDeleteFolder(f.id)}
          onUpdateVisibility={(v, c) => onUpdateVisibility(f.id, v, c)}
        />
      ))}
    </div>
  )
}
