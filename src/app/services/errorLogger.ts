import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, hasFirebaseConfig } from '@shared/services/firebase'

export interface ErrorLog {
  message: string
  stack?: string
  context: string
  timestamp: string
  url: string
  userAgent: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

const COLLECTION = 'error_logs'
const MAX_LOCAL_LOGS = 100
const LOCAL_STORAGE_KEY = 'error_logs_fallback'

const buildErrorLog = (
  error: unknown,
  context: string,
  severity: ErrorLog['severity'] = 'error',
): ErrorLog => ({
  message: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
  context,
  timestamp: new Date().toISOString(),
  url: window.location.href,
  userAgent: navigator.userAgent,
  severity,
})

const saveToLocal = (log: ErrorLog) => {
  try {
    const logs: ErrorLog[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    logs.push(log)
    if (logs.length > MAX_LOCAL_LOGS) logs.splice(0, logs.length - MAX_LOCAL_LOGS)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs))
  } catch {
    // localStorage full or unavailable
  }
}

const flushLocalLogs = async () => {
  if (!hasFirebaseConfig || !db) return
  try {
    const logs: ErrorLog[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    if (logs.length === 0) return

    const ref = collection(db, COLLECTION)
    const batch = logs.slice(0, 10)
    await Promise.all(batch.map(log => addDoc(ref, log)))

    const remaining = logs.slice(batch.length)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining))
  } catch {
    // will retry next time
  }
}

export const logError = async (
  error: unknown,
  context: string,
  severity: ErrorLog['severity'] = 'error',
) => {
  const log = buildErrorLog(error, context, severity)
  saveToLocal(log)

  if (hasFirebaseConfig && db) {
    try {
      await addDoc(collection(db, COLLECTION), {
        ...log,
        timestamp: serverTimestamp(),
      })
      await flushLocalLogs()
    } catch (firestoreError) {
      console.error('[ErrorLogger] Failed to save to Firestore:', firestoreError)
    }
  }
}

export const logWarning = (error: unknown, context: string) =>
  logError(error, context, 'warning')

export const logCritical = (error: unknown, context: string) =>
  logError(error, context, 'critical')

export const logInfo = (message: string, context: string) =>
  logError(new Error(message), context, 'info')
