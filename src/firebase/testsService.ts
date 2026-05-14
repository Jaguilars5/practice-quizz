import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from './config'
import type { Test } from '../types'

const COLLECTION = 'tests'

const testsRef = () => {
  if (!db) throw new Error('Firestore no disponible')
  return collection(db, COLLECTION)
}

export const getTests = async (): Promise<Test[]> => {
  const q = query(testsRef(), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Test))
}

export const getGlobalTests = async (): Promise<Test[]> => {
  const q = query(testsRef(), where('visibility', '==', 'global'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Test))
}

export const getTestsByCreator = async (email: string): Promise<Test[]> => {
  const q = query(testsRef(), where('createdBy', '==', email))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Test))
}

export const getTestById = async (id: string): Promise<Test | null> => {
  const snap = await getDoc(doc(db!, COLLECTION, id))
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as Test) : null
}

export const getTestByCode = async (code: string): Promise<Test | null> => {
  const q = query(testsRef(), where('code', '==', code), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const d = snapshot.docs[0]
  return { ...d.data(), id: d.id } as Test
}

export const createTest = async (test: Omit<Test, 'id'>): Promise<string> => {
  const ref = await addDoc(testsRef(), test)
  return ref.id
}

export const saveTestToFirestore = async (test: Test): Promise<string | null> => {
  const data = {
    ...test,
    visibility: test.visibility || 'private',
    code: test.code || '',
  }
  if (data.code) {
    const existing = await getTestByCode(data.code)
    if (existing) {
      await updateDoc(doc(db!, COLLECTION, existing.id), { ...data, id: undefined })
      return existing.id
    }
  }
  const { id, ...rest } = data
  const ref = await addDoc(testsRef(), rest)
  return ref.id
}

export const updateTest = async (id: string, data: Partial<Test>) => {
  await updateDoc(doc(db!, COLLECTION, id), data)
}

export const deleteTest = async (id: string) => {
  await deleteDoc(doc(db!, COLLECTION, id))
}

export const saveTestToLocal = (test: Test) => {
  const stored = JSON.parse(localStorage.getItem('tests') || '[]')
  const idx = stored.findIndex((t: Test) => t.id === test.id)
  if (idx >= 0) {
    stored[idx] = test
  } else {
    stored.push(test)
  }
  localStorage.setItem('tests', JSON.stringify(stored))
}

export const getLocalTests = (): Test[] => {
  return JSON.parse(localStorage.getItem('tests') || '[]')
}

export const getLocalTestByCode = (code: string): Test | null => {
  const tests = getLocalTests()
  return tests.find(t => t.code === code) || null
}
