import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { getLocalTests, saveTestToLocal, getTestByCode, getLocalTestByCode, getGlobalTests, getTestsByCreator, deleteTest } from '../firebase/testsService'
import { hasFirebaseConfig } from '../firebase/config'
import { getLocalFolders, getFoldersFromFirestore, createFolder, renameFolder, deleteFolder } from '../firebase/folderService'
import { TestCard } from '../components/creator/TestCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { JsonImporter } from '../components/creator/JsonImporter'
import { JsonPasteModal } from '../components/ui/JsonPasteModal'
import { FolderList } from '../components/ui/FolderList'
import { Plus, BookOpen, Search, AlertCircle, Loader2, FolderOpen, ClipboardPaste } from 'lucide-react'
import type { Test, Folder } from '../types'

export const Home = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [tests, setTests] = useState<Test[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [searchCode, setSearchCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Test | null>(null)

  const refreshFolders = () => setFolders(getLocalFolders())

  useEffect(() => {
    const loadFolders = async () => {
      const local = getLocalFolders()
      const seen = new Set(local.map(f => f.id))
      if (hasFirebaseConfig) {
        try {
          const fromFs = await getFoldersFromFirestore(user!.email)
          for (const f of fromFs) {
            if (!seen.has(f.id)) {
              local.push(f)
              seen.add(f.id)
            }
          }
          localStorage.setItem('folders', JSON.stringify(local))
        } catch {
          // fallback: only local
        }
      }
      setFolders(local)
    }
    loadFolders()

    const load = async () => {
      const local = getLocalTests()
      const seen = new Set(local.map(t => t.code))
      if (hasFirebaseConfig) {
        try {
          const [global, mine] = await Promise.all([
            getGlobalTests(),
            getTestsByCreator(user!.email),
          ])
          for (const t of [...global, ...mine]) {
            if (!seen.has(t.code)) {
              saveTestToLocal(t)
              local.push(t)
              seen.add(t.code)
            }
          }
        } catch {
          // fallback: only local
        }
      }
      setTests([...local])
    }
    load()
  }, [user])

  const filteredTests = useMemo(() => {
    if (!activeFolder) return tests
    if (activeFolder === '__uncategorized') return tests.filter(t => !t.folderId)
    return tests.filter(t => t.folderId === activeFolder)
  }, [tests, activeFolder])

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tests) {
      if (t.folderId) counts[t.folderId] = (counts[t.folderId] || 0) + 1
    }
    return counts
  }, [tests])

  if (!user) {
    navigate('/login')
    return null
  }

  const handleImport = (test: Test) => {
    navigate('/creator', { state: { editTest: test } })
  }

  const handlePasteImport = (test: Test) => {
    navigate('/creator', { state: { editTest: test } })
  }

  const handleSearch = async () => {
    const code = searchCode.trim().toUpperCase()
    if (!code) return

    setSearching(true)
    setSearchError('')

    const local = getLocalTestByCode(code)
    if (local) {
      navigate(`/play/${local.id}`)
      return
    }

    if (hasFirebaseConfig) {
      try {
        const found = await getTestByCode(code)
        if (found) {
          saveTestToLocal(found)
          setTests(getLocalTests())
          navigate(`/play/${found.id}`)
          return
        }
      } catch {
        setSearchError('Error al buscar en Firestore')
        setSearching(false)
        return
      }
    }

    setSearchError('No se encontró ningún test con ese código')
    setSearching(false)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const test = deleteConfirm

    if (hasFirebaseConfig) {
      try {
        const found = await getTestByCode(test.code)
        if (found) await deleteTest(found.id)
      } catch {
        // fallback
      }
    }

    const updated = getLocalTests().filter(t => t.id !== test.id)
    localStorage.setItem('tests', JSON.stringify(updated))
    setTests(updated)
    setDeleteConfirm(null)
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    await createFolder(newFolderName.trim(), user.email)
    setNewFolderName('')
    setShowNewFolder(false)
    refreshFolders()
  }

  const uncategorizedCount = tests.filter(t => !t.folderId).length

  const foldersWithCounts = folders.map(f => ({
    ...f,
    count: folderCounts[f.id] || 0,
  }))

  return (
    <div className="space-y-8">
      {deleteConfirm && (
        <Modal isOpen={true} onClose={() => setDeleteConfirm(null)} title="Eliminar test">
          <div className="space-y-4">
            <p className="text-gray-300">¿Eliminar <strong>{deleteConfirm.title}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </Modal>
      )}

      <JsonPasteModal isOpen={showPasteModal} onClose={() => setShowPasteModal(false)} onImport={handlePasteImport} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">QuizzY</h1>
          <p className="text-gray-400 mt-1">Juega y aprende con amigos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowPasteModal(true)}>
            <ClipboardPaste size={16} /> Pegar JSON
          </Button>
          <JsonImporter onImport={handleImport} />
          <Button onClick={() => navigate('/creator')}>
            <Plus size={18} /> Crear test
          </Button>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ingresa el código del test (ej: ABC123)"
              maxLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 font-mono tracking-widest text-lg uppercase focus:outline-none focus:border-primary-500"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching || !searchCode.trim()}>
            {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            Buscar
          </Button>
        </div>
        {searchError && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={14} />
            {searchError}
          </div>
        )}
      </Card>

      <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <Card className="p-3 sticky top-24">
            <FolderList
              folders={foldersWithCounts}
              activeFolder={activeFolder}
              onSelectFolder={setActiveFolder}
              onRenameFolder={async (id, name) => { await renameFolder(id, name); refreshFolders() }}
              onDeleteFolder={async (id) => { await deleteFolder(id); refreshFolders(); setTests(getLocalTests()); if (activeFolder === id) setActiveFolder(null) }}
              onNewFolder={() => setShowNewFolder(!showNewFolder)}
            />
            {showNewFolder && (
              <div className="flex gap-1 mt-2">
                <input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Nombre"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  autoFocus
                />
                <Button size="sm" onClick={handleCreateFolder}>OK</Button>
              </div>
            )}
            {folders.length > 0 && (
              <button
                onClick={() => setActiveFolder('__uncategorized')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mt-1 ${
                  activeFolder === '__uncategorized' ? 'bg-primary-500/10 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FolderOpen size={16} />
                <span className="flex-1 text-left">Sin carpeta</span>
                <span className="text-xs text-gray-500">{uncategorizedCount}</span>
              </button>
            )}
          </Card>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white mb-4">
            {activeFolder
              ? folders.find(f => f.id === activeFolder)?.name || 'Sin carpeta'
              : 'Tus tests'}
          </h2>

          {filteredTests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {activeFolder ? 'Esta carpeta está vacía' : 'No hay tests todavía'}
              </p>
              <p className="text-sm mt-1">Crea, importa o busca un test por código para empezar</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTests.map((test, i) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <TestCard
                    test={test}
                    onPlay={() => navigate(`/play/${test.id}`)}
                    onEdit={test.createdBy === user.email ? () => navigate('/creator', { state: { editTest: test } }) : undefined}
                    onDelete={test.createdBy === user.email ? () => setDeleteConfirm(test) : undefined}
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
