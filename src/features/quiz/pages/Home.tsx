import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@authState/useAuthStore'
import { getLocalTests, deleteTest, getTestByCode } from '@quizData'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { logError } from '@app/services/errorLogger'
import { TestCard } from '../components/TestCard'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { Modal } from '@shared/components/ui/Modal'
import { JsonImporter } from '../components/JsonImporter'
import { JsonPasteModal } from '@shared/components/ui/JsonPasteModal'
import { FolderList } from '@folders/components/FolderList'
import { useTestData } from '../hooks/useTestData'
import { useFolderManager } from '../hooks/useFolderManager'
import { useTestSearch } from '../hooks/useTestSearch'
import { useTestFilter } from '../hooks/useTestFilter'
import { useSharedFolderTests } from '../hooks/useSharedFolderTests'
import { Plus, BookOpen, Search, AlertCircle, Loader2, FolderOpen, ClipboardPaste, ArrowUpDown, Globe, KeyRound } from 'lucide-react'
import type { Test, Folder } from '@shared/types'

interface FolderWithCount extends Folder {
  count: number
}

export const Home = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState<Test | null>(null)
  const [showPasteModal, setShowPasteModal] = useState(false)

  const { tests, folders, refreshTests, refreshFolders } = useTestData(user?.email)

  const folderManager = useFolderManager(refreshFolders)
  const { activeFolder, setActiveFolder, showNewFolder, setShowNewFolder, newFolderName, setNewFolderName, folderSearchCode, setFolderSearchCode, folderSearching, folderSearchError, handleCreateFolder, handleJoinFolder, handleUpdateFolderVisibility, handleDeleteFolder, handleRenameFolder } = folderManager

  const sharedFolderTests = useSharedFolderTests(activeFolder, folders, user?.email)
  const { filteredTests, folderCounts, uncategorizedCount, sortNewest, setSortNewest, searchTitle, setSearchTitle } = useTestFilter(tests, sharedFolderTests, activeFolder)

  const handleTestFound = () => {
    refreshTests()
  }

  const { searchCode, setSearchCode, searching, searchError, handleSearch } = useTestSearch(handleTestFound)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleImport = (test: Test) => {
    navigate('/creator', { state: { editTest: test } })
  }

  const handlePasteImport = (test: Test) => {
    navigate('/creator', { state: { editTest: test } })
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const test = deleteConfirm

    if (hasFirebaseConfig) {
      try {
        const found = await getTestByCode(test.code)
        if (found) await deleteTest(found.id)
      } catch (error) {
        logError(error, 'Home:handleDelete')
      }
    }

    const updated = getLocalTests().filter(t => t.id !== test.id)
    localStorage.setItem('tests', JSON.stringify(updated))
    refreshTests()
    setDeleteConfirm(null)
  }

  const foldersWithCounts = folders.map(f => ({
    ...f,
    count: folderCounts[f.id] || 0,
  }))

  if (!user) return null

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">QuizzY</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Juega y aprende con amigos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setShowPasteModal(true)} className="text-xs sm:text-sm">
            <ClipboardPaste size={14} /> Pegar JSON
          </Button>
          <span className="hidden sm:inline"><JsonImporter onImport={handleImport} /></span>
          <Button size="sm" onClick={() => navigate('/creator')} className="text-xs sm:text-sm">
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
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle size={14} />
            {searchError}
          </div>
        )}
      </Card>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="md:w-48 shrink-0">
          <details className="md:hidden">
            <summary className="text-sm text-gray-400 cursor-pointer mb-2 select-none">Carpetas ▸</summary>
            <FolderSidebar
              foldersWithCounts={foldersWithCounts}
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              showNewFolder={showNewFolder}
              setShowNewFolder={setShowNewFolder}
              newFolderName={newFolderName}
              setNewFolderName={setNewFolderName}
              handleCreateFolder={() => handleCreateFolder(user.email)}
              uncategorizedCount={uncategorizedCount}
              folderSearchCode={folderSearchCode}
              setFolderSearchCode={setFolderSearchCode}
              handleJoinFolder={handleJoinFolder}
              folderSearching={folderSearching}
              folderSearchError={folderSearchError}
              handleRenameFolder={(id, name) => handleRenameFolder(id, name, refreshFolders)}
              handleDeleteFolder={(id) => handleDeleteFolder(id, refreshTests, refreshFolders)}
              handleUpdateFolderVisibility={handleUpdateFolderVisibility}
              foldersCount={folders.length}
            />
          </details>
          <div className="hidden md:block">
            <FolderSidebar
              foldersWithCounts={foldersWithCounts}
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              showNewFolder={showNewFolder}
              setShowNewFolder={setShowNewFolder}
              newFolderName={newFolderName}
              setNewFolderName={setNewFolderName}
              handleCreateFolder={() => handleCreateFolder(user.email)}
              uncategorizedCount={uncategorizedCount}
              folderSearchCode={folderSearchCode}
              setFolderSearchCode={setFolderSearchCode}
              handleJoinFolder={handleJoinFolder}
              folderSearching={folderSearching}
              folderSearchError={folderSearchError}
              handleRenameFolder={(id, name) => handleRenameFolder(id, name, refreshFolders)}
              handleDeleteFolder={(id) => handleDeleteFolder(id, refreshTests, refreshFolders)}
              handleUpdateFolderVisibility={handleUpdateFolderVisibility}
              foldersCount={folders.length}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {activeFolder
                  ? (() => {
                      const f = folders.find(fo => fo.id === activeFolder)
                      return f ? <>{f.name} {f.visibility === 'public' ? <Globe size={16} className="text-green-400" /> : f.visibility === 'code' ? <KeyRound size={16} className="text-yellow-400" /> : null}</> : 'Sin carpeta'
                    })()
                  : 'Tus tests'}
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Buscar test..."
                  className="bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 w-40 sm:w-48"
                />
              </div>
            </div>
            <button
              onClick={() => setSortNewest(!sortNewest)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowUpDown size={14} />
              {sortNewest ? 'Más recientes' : 'Más antiguos'}
            </button>
          </div>

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

interface FolderSidebarProps {
  foldersWithCounts: FolderWithCount[]
  activeFolder: string | null
  setActiveFolder: (id: string | null) => void
  showNewFolder: boolean
  setShowNewFolder: (show: boolean) => void
  newFolderName: string
  setNewFolderName: (name: string) => void
  handleCreateFolder: () => void
  uncategorizedCount: number
  folderSearchCode: string
  setFolderSearchCode: (code: string) => void
  handleJoinFolder: () => void
  folderSearching: boolean
  folderSearchError: string
  handleRenameFolder: (id: string, name: string) => void
  handleDeleteFolder: (id: string) => void
  handleUpdateFolderVisibility: (id: string, visibility: Folder['visibility'], code?: string) => void
  foldersCount: number
}

const FolderSidebar = ({
  foldersWithCounts, activeFolder, setActiveFolder,
  showNewFolder, setShowNewFolder, newFolderName, setNewFolderName, handleCreateFolder,
  uncategorizedCount, folderSearchCode, setFolderSearchCode, handleJoinFolder,
  folderSearching, folderSearchError, handleRenameFolder, handleDeleteFolder, handleUpdateFolderVisibility,
  foldersCount,
}: FolderSidebarProps) => (
  <Card className="p-3 sticky top-24 space-y-3">
    <FolderList
      folders={foldersWithCounts}
      activeFolder={activeFolder}
      currentUserEmail=""
      onSelectFolder={setActiveFolder}
      onRenameFolder={handleRenameFolder}
      onDeleteFolder={handleDeleteFolder}
      onUpdateVisibility={handleUpdateFolderVisibility}
      onNewFolder={() => setShowNewFolder(!showNewFolder)}
    />
    {showNewFolder && (
      <div className="flex gap-1 mt-2">
        <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()} placeholder="Nombre" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" autoFocus />
        <Button size="sm" onClick={handleCreateFolder}>OK</Button>
      </div>
    )}
    {foldersCount > 0 && (
      <button onClick={() => setActiveFolder('__uncategorized')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all mt-1 ${activeFolder === '__uncategorized' ? 'bg-primary-500/10 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`}>
        <FolderOpen size={16} />
        <span className="flex-1 text-left">Sin carpeta</span>
        <span className="text-xs text-gray-500">{uncategorizedCount}</span>
      </button>
    )}
    <div className="border-t border-gray-700 pt-2">
      <div className="flex gap-1 min-w-0">
        <input
          type="text"
          value={folderSearchCode}
          onChange={(e) => setFolderSearchCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoinFolder()}
          placeholder="Código de carpeta"
          maxLength={6}
          className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white placeholder-gray-500 font-mono tracking-wider uppercase focus:outline-none focus:border-primary-500"
        />
        <Button size="sm" onClick={handleJoinFolder} disabled={folderSearching || !folderSearchCode.trim()} className="shrink-0">
          {folderSearching ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
        </Button>
      </div>
      {folderSearchError && <p className="text-xs text-red-400 mt-1">{folderSearchError}</p>}
    </div>
  </Card>
)
