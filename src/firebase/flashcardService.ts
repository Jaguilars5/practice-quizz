import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, limit } from 'firebase/firestore'
import { db } from './config'
import type { FlashcardSet } from '../types'

const COLLECTION = 'flashcards'
const STORAGE_KEY = 'flashcards'

const ref = () => {
  if (!db) throw new Error('Firestore no disponible')
  return collection(db, COLLECTION)
}

export const getLocalFlashcardSets = (): FlashcardSet[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
}

const saveToLocal = (sets: FlashcardSet[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
}

export const saveFlashcardSetToLocal = (set: FlashcardSet) => {
  const stored = getLocalFlashcardSets()
  const idx = stored.findIndex(s => s.id === set.id)
  if (idx >= 0) {
    stored[idx] = set
  } else {
    stored.push(set)
  }
  saveToLocal(stored)
}

export const getFlashcardSetsByCreator = async (email: string): Promise<FlashcardSet[]> => {
  const q = query(ref(), where('createdBy', '==', email))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as FlashcardSet))
}

export const getGlobalFlashcardSets = async (): Promise<FlashcardSet[]> => {
  const q = query(ref(), where('visibility', '==', 'global'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as FlashcardSet))
}

export const getFlashcardSetById = async (id: string): Promise<FlashcardSet | null> => {
  const snap = await getDoc(doc(db!, COLLECTION, id))
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as FlashcardSet) : null
}

export const getFlashcardSetByCode = async (code: string): Promise<FlashcardSet | null> => {
  const q = query(ref(), where('code', '==', code), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const d = snapshot.docs[0]
  return { ...d.data(), id: d.id } as FlashcardSet
}

export const getFlashcardSetsByFolderId = async (folderId: string): Promise<FlashcardSet[]> => {
  const q = query(ref(), where('folderId', '==', folderId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as FlashcardSet))
}

export const getLocalFlashcardSetByCode = (code: string): FlashcardSet | null => {
  return getLocalFlashcardSets().find(s => s.code === code) || null
}

export const saveFlashcardSetToFirestore = async (set: FlashcardSet): Promise<string | null> => {
  const data = {
    ...set,
    visibility: set.visibility || 'private',
    code: set.code || '',
  }
  if (data.code) {
    const existing = await getFlashcardSetByCode(data.code)
    if (existing) {
      await updateDoc(doc(db!, COLLECTION, existing.id), { ...data, id: undefined })
      return existing.id
    }
  }
  const { id, ...rest } = data
  const ref_ = await addDoc(ref(), rest)
  return ref_.id
}

export const deleteFlashcardSetFromFirestore = async (code: string) => {
  const found = await getFlashcardSetByCode(code)
  if (found) await deleteDoc(doc(db!, COLLECTION, found.id))
}

export const deleteFlashcardSetLocal = (id: string) => {
  const updated = getLocalFlashcardSets().filter(s => s.id !== id)
  saveToLocal(updated)
}
