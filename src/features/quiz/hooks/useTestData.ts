import { useEffect, useState } from 'react'
import { hasFirebaseConfig } from '@shared/services/firebase'
import { getLocalTests, saveTestToLocal, getGlobalTests, getTestsByCreator } from '@quizData'
import { getLocalFolders, getFoldersFromFirestore, getPublicFoldersFromFirestore } from '@folders/services/folders.api'
import { logError } from '@app/services/errorLogger'
import type { Test, Folder } from '@shared/types'

interface UseTestDataReturn {
  tests: Test[]
  folders: Folder[]
  loading: boolean
  refreshTests: () => void
  refreshFolders: () => void
}

export const useTestData = (userEmail: string | undefined): UseTestDataReturn => {
  const [tests, setTests] = useState<Test[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  const refreshFolders = () => setFolders(getLocalFolders())
  const refreshTests = () => setTests(getLocalTests())

  useEffect(() => {
    if (!userEmail) return
    let mounted = true

    const load = async () => {
      const localFolders = getLocalFolders()
      const seenFolders = new Set(localFolders.map(f => f.id))

      const localTests = getLocalTests()
      const seenTests = new Set(localTests.map(t => t.code))

      if (hasFirebaseConfig) {
        try {
          const [fromFs, publicFolders, globalTests, mine] = await Promise.all([
            getFoldersFromFirestore(userEmail),
            getPublicFoldersFromFirestore(),
            getGlobalTests(),
            getTestsByCreator(userEmail),
          ])

          for (const f of [...fromFs, ...publicFolders]) {
            if (!seenFolders.has(f.id)) {
              localFolders.push(f)
              seenFolders.add(f.id)
            }
          }
          localStorage.setItem('folders', JSON.stringify(localFolders))

          for (const t of [...globalTests, ...mine]) {
            if (!seenTests.has(t.code)) {
              saveTestToLocal(t)
              localTests.push(t)
              seenTests.add(t.code)
            }
          }
        } catch (error) {
          logError(error, 'useTestData:loadFirebaseData')
        }
      }

      if (mounted) {
        setFolders(localFolders)
        setTests([...localTests])
        setLoading(false)
      }
    }

    load()

    return () => { mounted = false }
  }, [userEmail])

  return { tests, folders, loading, refreshTests, refreshFolders }
}
