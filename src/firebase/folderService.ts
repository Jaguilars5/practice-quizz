import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from './config'
import type { Folder } from '../types'

const STORAGE_KEY = 'folders'
const COLLECTION = 'folders'

const foldersRef = () => {
  if (!db) throw new Error('Firestore no disponible')
  return collection(db, COLLECTION)
}

export const getLocalFolders = (): Folder[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

const saveFoldersToLocal = (folders: Folder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
}

export const getFoldersFromFirestore = async (email: string): Promise<Folder[]> => {
  const q = query(foldersRef(), where('createdBy', '==', email))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Folder))
}

export const createFolder = async (name: string, createdBy: string): Promise<Folder> => {
  const folder: Omit<Folder, 'id'> = {
    name,
    createdBy,
    createdAt: new Date().toISOString(),
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
