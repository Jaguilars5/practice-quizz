import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@authState/useAuthStore'
import { getLocalFlashcardSets, saveFlashcardSetToLocal, getFlashcardSetsByCreator, getGlobalFlashcardSets, getFlashcardSetByCode, getLocalFlashcardSetByCode, getFlashcardSetsByFolderId, deleteFlashcardSetFromFirestore, deleteFlashcardSetLocal } from '@flashcardData'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { getLocalFolders, getFoldersFromFirestore, createFolder, renameFolder, deleteFolder, getPublicFoldersFromFirestore, getFolderByCodeFromFirestore, getFolderByCodeLocal, updateFolderVisibility } from '@folders/services/folders.api'
import { logError } from '@app/services/errorLogger'
import { FlashcardCard } from '../components/FlashcardCard'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Modal } from '@shared/components/ui/Modal'
import { FolderList } from '@folders/components/FolderList'
import { Plus, BookOpen, Search, AlertCircle, Loader2, FolderOpen, ArrowUpDown, Globe, KeyRound } from 'lucide-react'
import type { FlashcardSet, Folder } from '@shared/types'

export const FlashcardsHome = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [searchCode, setSearchCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<FlashcardSet | null>(null)
  const [sortNewest, setSortNewest] = useState(true)
  const [searchTitle, setSearchTitle] = useState('')
  const [sharedFolderSets, setSharedFolderSets] = useState<FlashcardSet[]>([])
  const [folderSearchCode, setFolderSearchCode] = useState('')
  const [folderSearching, setFolderSearching] = useState(false)
  const [folderSearchError, setFolderSearchError] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)

  const refreshFolders = () => setFolders(getLocalFolders())

  useEffect(() => {
    if (!user) { navigate('/login'); return }

    const loadFolders = async () => {
      const local = getLocalFolders()
      const seen = new Set(local.map(f => f.id))
      if (hasFirebaseConfig) {
        try {
          const [fromFs, publicFolders] = await Promise.all([
            getFoldersFromFirestore(user!.email),
            getPublicFoldersFromFirestore(),
          ])
          for (const f of [...fromFs, ...publicFolders]) {
            if (!seen.has(f.id)) { local.push(f); seen.add(f.id) }
          }
          localStorage.setItem('folders', JSON.stringify(local))
        } catch (error) {
          logError(error, 'FlashcardsHome:loadFolders')
        }
      }
      setFolders(local)
    }
    loadFolders()

    const load = async () => {
      const local = getLocalFlashcardSets()
      const seen = new Set(local.map(s => s.code))
      if (hasFirebaseConfig) {
        try {
          const [global, mine] = await Promise.all([
            getGlobalFlashcardSets(),
            getFlashcardSetsByCreator(user!.email),
          ])
          for (const s of [...global, ...mine]) {
            if (!seen.has(s.code)) {
              saveFlashcardSetToLocal(s)
              local.push(s)
              seen.add(s.code)
            }
          }
        } catch (error) {
          logError(error, 'FlashcardsHome:loadFlashcards')
        }
      }
      setSets([...local])
    }
    load()
  }, [user, navigate])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!activeFolder || activeFolder === '__uncategorized') { setSharedFolderSets([]); return }
    const folder = folders.find(f => f.id === activeFolder)
    if (!folder || folder.createdBy === user!.email) { setSharedFolderSets([]); return }
    const loadShared = async () => {
      try {
        const folderSets = await getFlashcardSetsByFolderId(activeFolder)
        setSharedFolderSets(folderSets)
      } catch (error) {
        logError(error, 'FlashcardsHome:loadShared')
        setSharedFolderSets([])
      }
    }
    loadShared()
  }, [activeFolder, folders, user])
  /* eslint-enable react-hooks/set-state-in-effect */

  const allSets = useMemo(() => {
    const seen = new Set(sets.map(s => s.id))
    const merged = [...sets]
    for (const s of sharedFolderSets) {
      if (!seen.has(s.id)) { merged.push(s); seen.add(s.id) }
    }
    return merged
  }, [sets, sharedFolderSets])

  const filteredSets = useMemo(() => {
    let result = !activeFolder ? allSets
      : activeFolder === '__uncategorized' ? allSets.filter(s => !s.folderId)
      : allSets.filter(s => s.folderId === activeFolder)
    if (searchTitle.trim()) {
      const q = searchTitle.toLowerCase()
      result = result.filter(s => s.title.toLowerCase().includes(q))
    }
    return [...result].sort((a, b) =>
      sortNewest
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [allSets, activeFolder, sortNewest, searchTitle])

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of allSets) { if (s.folderId) counts[s.folderId] = (counts[s.folderId] || 0) + 1 }
    return counts
  }, [allSets])

  const handleSearch = async () => {
    const code = searchCode.trim().toUpperCase()
    if (!code) return
    setSearching(true)
    setSearchError('')

    const local = getLocalFlashcardSetByCode(code)
    if (local) { navigate(`/flashcards/study/${local.id}`); return }

    if (hasFirebaseConfig) {
      try {
        const found = await getFlashcardSetByCode(code)
        if (found) {
          saveFlashcardSetToLocal(found)
          setSets(getLocalFlashcardSets())
          navigate(`/flashcards/study/${found.id}`)
          return
        }
      } catch (error) {
        logError(error, 'FlashcardsHome:handleSearch')
        setSearchError('Error al buscar')
        setSearching(false)
        return
      }
    }
    setSearchError('No se encontró ningún set con ese código')
    setSearching(false)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const s = deleteConfirm
    if (hasFirebaseConfig) {
      try { await deleteFlashcardSetFromFirestore(s.code) } catch (error) {
        logError(error, 'FlashcardsHome:handleDelete')
      }
    }
    deleteFlashcardSetLocal(s.id)
    setSets(getLocalFlashcardSets())
    setDeleteConfirm(null)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return
    await createFolder(newFolderName.trim(), user.email)
    setNewFolderName(''); setShowNewFolder(false); refreshFolders()
  }

  const handleJoinFolder = async () => {
    const code = folderSearchCode.trim().toUpperCase()
    if (!code) return
    setFolderSearching(true); setFolderSearchError('')
    const local = getFolderByCodeLocal(code)
    if (local) { setActiveFolder(local.id); setFolderSearchCode(''); setFolderSearching(false); return }
    if (hasFirebaseConfig) {
      try {
        const found = await getFolderByCodeFromFirestore(code)
        if (found) {
          const localFolders = getLocalFolders()
          if (!localFolders.find(f => f.id === found.id)) {
            localFolders.push(found)
            localStorage.setItem('folders', JSON.stringify(localFolders))
          }
          setFolders(getLocalFolders()); setActiveFolder(found.id); setFolderSearchCode(''); setFolderSearching(false); return
        }
      } catch (error) {
        logError(error, 'FlashcardsHome:handleJoinFolder')
        setFolderSearchError('Error al buscar')
        setFolderSearching(false)
        return
      }
    }
    setFolderSearchError('No se encontró ninguna carpeta con ese código'); setFolderSearching(false)
  }

  const handleUpdateFolderVisibility = async (id: string, visibility: 'private' | 'public' | 'code', code?: string) => {
    await updateFolderVisibility(id, visibility, code); refreshFolders()
  }

  const uncategorizedCount = allSets.filter(s => !s.folderId).length
  const foldersWithCounts = folders.map(f => ({ ...f, count: folderCounts[f.id] || 0 }))

  if (!user) return null

  return (
    <div className="space-y-8">
      {deleteConfirm && (
        <Modal isOpen={true} onClose={() => setDeleteConfirm(null)} title="Eliminar set">
          <div className="space-y-4">
            <p className="text-gray-300">¿Eliminar <strong>{deleteConfirm.title}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Tarjetas didácticas</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Estudiá con flashcards</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => navigate('/flashcards/crear')} className="text-xs sm:text-sm">
            <Plus size={14} /> Crear
          </Button>
        </div>
      </div>

      <Card className="space-y-3 p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Código (ej: ABC123)"
              maxLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 sm:py-3 text-white placeholder-gray-500 font-mono tracking-widest text-base uppercase focus:outline-none focus:border-primary-500"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching || !searchCode.trim()} className="shrink-0">
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </div>
        {searchError && (
          <div className="flex items-center gap-2 text-sm text-red-400"><AlertCircle size={14} />{searchError}</div>
        )}
      </Card>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="md:w-48 shrink-0">
          <details className="md:hidden">
            <summary className="text-sm text-gray-400 cursor-pointer mb-2 select-none">Carpetas ▸</summary>
            <Card className="p-3 space-y-3">
              <FolderList folders={foldersWithCounts} activeFolder={activeFolder} currentUserEmail={user.email}
                onSelectFolder={setActiveFolder}
                onRenameFolder={async (id, name) => { await renameFolder(id, name); refreshFolders() }}
                onDeleteFolder={async (id) => { await deleteFolder(id); refreshFolders(); setSets(getLocalFlashcardSets()); if (activeFolder === id) setActiveFolder(null) }}
                onUpdateVisibility={handleUpdateFolderVisibility} onNewFolder={() => setShowNewFolder(!showNewFolder)} />
              {showNewFolder && (
                <div className="flex gap-1 mt-2">
                  <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()} placeholder="Nombre" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" autoFocus />
                  <Button size="sm" onClick={handleCreateFolder}>OK</Button>
                </div>
              )}
              {folders.length > 0 && (
                <button onClick={() => setActiveFolder('__uncategorized')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mt-1 ${activeFolder === '__uncategorized' ? 'bg-primary-500/10 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
                  <FolderOpen size={16} /><span className="flex-1 text-left">Sin carpeta</span><span className="text-xs text-gray-500">{uncategorizedCount}</span>
                </button>
              )}
              <div className="border-t border-gray-700 pt-2">
                <div className="flex gap-1 min-w-0">
                  <input type="text" value={folderSearchCode} onChange={(e) => setFolderSearchCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleJoinFolder()} placeholder="Código de carpeta" maxLength={6} className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 font-mono tracking-wider uppercase focus:outline-none focus:border-primary-500" />
                  <Button size="sm" onClick={handleJoinFolder} disabled={folderSearching || !folderSearchCode.trim()} className="shrink-0">
                    {folderSearching ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  </Button>
                </div>
                {folderSearchError && <p className="text-xs text-red-400 mt-1">{folderSearchError}</p>}
              </div>
            </Card>
          </details>
          <div className="hidden md:block">
            <Card className="p-3 sticky top-24 space-y-3">
              <FolderList folders={foldersWithCounts} activeFolder={activeFolder} currentUserEmail={user.email}
                onSelectFolder={setActiveFolder}
                onRenameFolder={async (id, name) => { await renameFolder(id, name); refreshFolders() }}
                onDeleteFolder={async (id) => { await deleteFolder(id); refreshFolders(); setSets(getLocalFlashcardSets()); if (activeFolder === id) setActiveFolder(null) }}
                onUpdateVisibility={handleUpdateFolderVisibility} onNewFolder={() => setShowNewFolder(!showNewFolder)} />
              {showNewFolder && (
                <div className="flex gap-1 mt-2">
                  <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()} placeholder="Nombre" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" autoFocus />
                  <Button size="sm" onClick={handleCreateFolder}>OK</Button>
                </div>
              )}
              {folders.length > 0 && (
                <button onClick={() => setActiveFolder('__uncategorized')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mt-1 ${activeFolder === '__uncategorized' ? 'bg-primary-500/10 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
                  <FolderOpen size={16} /><span className="flex-1 text-left">Sin carpeta</span><span className="text-xs text-gray-500">{uncategorizedCount}</span>
                </button>
              )}
              <div className="border-t border-gray-700 pt-2">
                <div className="flex gap-1 min-w-0">
                  <input type="text" value={folderSearchCode} onChange={(e) => setFolderSearchCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === 'Enter' && handleJoinFolder()} placeholder="Código de carpeta" maxLength={6} className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 font-mono tracking-wider uppercase focus:outline-none focus:border-primary-500" />
                  <Button size="sm" onClick={handleJoinFolder} disabled={folderSearching || !folderSearchCode.trim()} className="shrink-0">
                    {folderSearching ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  </Button>
                </div>
                {folderSearchError && <p className="text-xs text-red-400 mt-1">{folderSearchError}</p>}
              </div>
            </Card>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {activeFolder
                  ? (() => { const f = folders.find(fo => fo.id === activeFolder); return f ? <>{f.name} {f.visibility === 'public' ? <Globe size={16} className="text-green-400" /> : f.visibility === 'code' ? <KeyRound size={16} className="text-yellow-400" /> : null}</> : 'Sin carpeta' })()
                  : 'Tus sets'}
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} placeholder="Buscar..." className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 w-40 sm:w-48" />
              </div>
            </div>
            <button onClick={() => setSortNewest(!sortNewest)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
              <ArrowUpDown size={14} />{sortNewest ? 'Más recientes' : 'Más antiguos'}
            </button>
          </div>

          {filteredSets.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">{activeFolder ? 'Esta carpeta está vacía' : 'No hay sets todavía'}</p>
              <p className="text-sm mt-1">Creá un set o buscá por código para empezar</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSets.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}>
                  <FlashcardCard
                    set={s}
                    onStudy={() => navigate(`/flashcards/study/${s.id}`)}
                    onEdit={s.createdBy === user.email ? () => navigate('/flashcards/crear', { state: { editSet: s } }) : undefined}
                    onDelete={s.createdBy === user.email ? () => setDeleteConfirm(s) : undefined}
                    showCode
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

