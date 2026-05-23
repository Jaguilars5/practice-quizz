import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, limit } from 'firebase/firestore'
import { db } from './config'
import type { Folder } from '../types'

const STORAGE_KEY = 'folders'
const COLLECTION = 'folders'

const foldersRef = () => {
  if (!db) throw new Error('Firestore no disponible')
  return collection(db, COLLECTION)
}

export const getLocalFolders = (): Folder[] => {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  return raw.map((f: Partial<Folder>) => ({
    id: f.id || '',
    name: f.name || '',
    createdBy: f.createdBy || '',
    createdAt: f.createdAt || '',
    visibility: f.visibility || 'private',
    code: f.code,
  }))
}

const saveFoldersToLocal = (folders: Folder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
}

const mapFolder = (d: { id: string; data(): Record<string, unknown> }): Folder => {
  const data = d.data()
  return {
    id: d.id,
    name: data.name as string || '',
    createdBy: data.createdBy as string || '',
    createdAt: data.createdAt as string || '',
    visibility: (data.visibility as Folder['visibility']) || 'private',
    code: data.code as string | undefined,
  }
}

export const getFoldersFromFirestore = async (email: string): Promise<Folder[]> => {
  const q = query(foldersRef(), where('createdBy', '==', email))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapFolder)
}

export const getPublicFoldersFromFirestore = async (): Promise<Folder[]> => {
  const q = query(foldersRef(), where('visibility', '==', 'public'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(mapFolder)
}

export const getFolderByCodeFromFirestore = async (code: string): Promise<Folder | null> => {
  const q = query(foldersRef(), where('code', '==', code), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return mapFolder(snapshot.docs[0])
}

export const getFolderByCodeLocal = (code: string): Folder | null => {
  return getLocalFolders().find(f => f.code === code) || null
}

export const getLocalFolderById = (id: string): Folder | null => {
  return getLocalFolders().find(f => f.id === id) || null
}

export const createFolder = async (
  name: string,
  createdBy: string,
  visibility: 'private' | 'public' | 'code' = 'private',
  code?: string,
): Promise<Folder> => {
  const folder: Omit<Folder, 'id'> = {
    name,
    createdBy,
    createdAt: new Date().toISOString(),
    visibility,
    code,
  }

  let folderWithId: Folder

  if (db) {
    try {
      const ref = await addDoc(foldersRef(), folder)
      folderWithId = { ...folder, id: ref.id }
    } catch {
      folderWithId = { ...folder, id: `folder_${Date.now()}` }
    }
  } else {
    folderWithId = { ...folder, id: `folder_${Date.now()}` }
  }

  const folders = getLocalFolders()
  folders.push(folderWithId)
  saveFoldersToLocal(folders)
  return folderWithId
}

export const renameFolder = async (id: string, name: string) => {
  if (db) {
    try {
      await updateDoc(doc(db, COLLECTION, id), { name })
    } catch {
      // fallback: only local
    }
  }
  const folders = getLocalFolders()
  const idx = folders.findIndex(f => f.id === id)
  if (idx >= 0) {
    folders[idx].name = name
    saveFoldersToLocal(folders)
  }
}

export const updateFolderVisibility = async (id: string, visibility: 'private' | 'public' | 'code', code?: string) => {
  if (db) {
    try {
      const data: Record<string, unknown> = { visibility }
      if (code !== undefined) data.code = code
      await updateDoc(doc(db, COLLECTION, id), data)
    } catch {
      // fallback: only local
    }
  }
  const folders = getLocalFolders()
  const idx = folders.findIndex(f => f.id === id)
  if (idx >= 0) {
    folders[idx].visibility = visibility
    if (code !== undefined) folders[idx].code = code
    else if (visibility !== 'code') folders[idx].code = undefined
    saveFoldersToLocal(folders)
  }
}

export const deleteFolder = async (id: string) => {
  if (db) {
    try {
      await deleteDoc(doc(db, COLLECTION, id))
    } catch {
      // fallback: only local
    }
  }

  const folders = getLocalFolders().filter(f => f.id !== id)
  saveFoldersToLocal(folders)

  const tests = JSON.parse(localStorage.getItem('tests') || '[]')
  const updated = tests.map((t: { folderId?: string }) => {
    if (t.folderId === id) {
      const { folderId, ...rest } = t
      return rest
    }
    return t
  })
  localStorage.setItem('tests', JSON.stringify(updated))
}
