import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

if (getApps().length === 0) {
  const useEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST)
  initializeApp(useEmulator ? { projectId: 'demo-project' } : undefined)
}

export const db = getFirestore()
export const auth = getAuth()
