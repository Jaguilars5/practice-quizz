import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getLocalTests, saveTestToLocal, getTestByCode, getLocalTestByCode, getGlobalTests } from '../firebase/testsService'
import { hasFirebaseConfig } from '../firebase/config'
import { TestCard } from '../components/creator/TestCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { JsonImporter } from '../components/creator/JsonImporter'
import { Plus, BookOpen, Search, AlertCircle, Loader2 } from 'lucide-react'
import type { Test } from '../types'

export const Home = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [tests, setTests] = useState<Test[]>([])
  const [searchCode, setSearchCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    const load = async () => {
      const local = getLocalTests()
      if (hasFirebaseConfig) {
        try {
          const global = await getGlobalTests()
          const seen = new Set(local.map(t => t.code))
          for (const t of global) {
            if (!seen.has(t.code)) {
              local.push(t)
              seen.add(t.code)
            }
          }
        } catch {
          // fallback: only local
        }
      }
      setTests(local)
    }
    load()
  }, [])

  if (!user) {
    navigate('/login')
    return null
  }

  const handleImport = (test: Test) => {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">QuizzY</h1>
          <p className="text-gray-400 mt-1">Juega y aprende con amigos</p>
        </div>
        <div className="flex gap-3">
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

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Tus tests</h2>

        {tests.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay tests todavía</p>
            <p className="text-sm mt-1">Crea, importa o busca un test por código para empezar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onPlay={() => navigate(`/play/${test.id}`)}
                onEdit={test.createdBy === user.email ? () => navigate('/creator', { state: { editTest: test } }) : undefined}
                showCode
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
