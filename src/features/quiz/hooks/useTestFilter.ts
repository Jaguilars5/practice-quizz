import { useMemo, useState } from 'react'
import type { Test } from '@shared/types'

interface UseTestFilterReturn {
  allTests: Test[]
  filteredTests: Test[]
  folderCounts: Record<string, number>
  uncategorizedCount: number
  sortNewest: boolean
  setSortNewest: (sort: boolean) => void
  searchTitle: string
  setSearchTitle: (title: string) => void
}

export const useTestFilter = (
  tests: Test[],
  sharedFolderTests: Test[],
  activeFolder: string | null,
): UseTestFilterReturn => {
  const [sortNewest, setSortNewest] = useState(true)
  const [searchTitle, setSearchTitle] = useState('')

  const allTests = useMemo(() => {
    const seen = new Set(tests.map(t => t.id))
    const merged = [...tests]
    for (const t of sharedFolderTests) {
      if (!seen.has(t.id)) {
        merged.push(t)
        seen.add(t.id)
      }
    }
    return merged
  }, [tests, sharedFolderTests])

  const filteredTests = useMemo(() => {
    let result = !activeFolder ? allTests
      : activeFolder === '__uncategorized' ? allTests.filter(t => !t.folderId)
      : allTests.filter(t => t.folderId === activeFolder)
    if (searchTitle.trim()) {
      const q = searchTitle.toLowerCase()
      result = result.filter(t => t.title.toLowerCase().includes(q))
    }
    return [...result].sort((a, b) =>
      sortNewest
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [allTests, activeFolder, sortNewest, searchTitle])

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of allTests) {
      if (t.folderId) counts[t.folderId] = (counts[t.folderId] || 0) + 1
    }
    return counts
  }, [allTests])

  const uncategorizedCount = allTests.filter(t => !t.folderId).length

  return {
    allTests,
    filteredTests,
    folderCounts,
    uncategorizedCount,
    sortNewest,
    setSortNewest,
    searchTitle,
    setSearchTitle,
  }
}
