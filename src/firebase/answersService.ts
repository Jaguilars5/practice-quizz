import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from './config'
import type { AnswerSet } from '../types'

const COLLECTION = 'respuestas'

const answersRef = () => {
  if (!db) throw new Error('Firestore no disponible')
  return collection(db, COLLECTION)
}

export const getAnswersByTest = async (testId: string): Promise<AnswerSet[]> => {
  const q = query(answersRef(), where('testId', '==', testId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => d.data() as AnswerSet)
}

export const getAnswersByPlayer = async (playerId: string): Promise<AnswerSet[]> => {
  const q = query(answersRef(), where('playerId', '==', playerId), orderBy('finishedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => d.data() as AnswerSet)
}

export const submitAnswer = async (answer: AnswerSet): Promise<void> => {
  await addDoc(answersRef(), answer)
}

export const saveAnswerToLocal = (answer: AnswerSet) => {
  const stored = JSON.parse(localStorage.getItem('answers') || '[]')
  stored.push(answer)
  localStorage.setItem('answers', JSON.stringify(stored))
}

export const getLocalAnswers = (testId?: string, playerId?: string): AnswerSet[] => {
  let all: AnswerSet[] = JSON.parse(localStorage.getItem('answers') || '[]')
  if (testId) all = all.filter(a => a.testId === testId)
  if (playerId) all = all.filter(a => a.playerId === playerId)
  return all
}
