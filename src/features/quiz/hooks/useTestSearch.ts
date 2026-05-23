import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { getLocalTestByCode, getTestByCode, saveTestToLocal, getLocalTests } from '@quizData'
import { logError } from '@app/services/errorLogger'
import type { Test } from '@shared/types'

interface UseTestSearchReturn {
  searchCode: string
  setSearchCode: (code: string) => void
  searching: boolean
  searchError: string
  handleSearch: () => Promise<void>
}

export const useTestSearch = (
  onTestFound: (tests: Test[]) => void,
): UseTestSearchReturn => {
  const navigate = useNavigate()
  const [searchCode, setSearchCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const handleSearch = useCallback(async () => {
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
          onTestFound(getLocalTests())
          navigate(`/play/${found.id}`)
          return
        }
      } catch (error) {
        logError(error, 'useTestSearch:handleSearch')
        setSearchError('Error al buscar en Firestore')
        setSearching(false)
        return
      }
    }

    setSearchError('No se encontró ningún test con ese código')
    setSearching(false)
  }, [searchCode, navigate, onTestFound])

  return { searchCode, setSearchCode, searching, searchError, handleSearch }
}
