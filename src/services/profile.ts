import { db } from '../firebase.js'
import { FieldValue } from 'firebase-admin/firestore'

const COLLECTION = 'users'

export interface Profile {
  phone: string
  name: string
  email: string
}

export async function getProfile(phone: string): Promise<Profile> {
  const doc = await db.collection(COLLECTION).doc(phone).get()
  if (!doc.exists) {
    return { phone, name: '', email: '' }
  }
  const data = doc.data()!
  return { phone: data.phone, name: data.name, email: data.email }
}

export async function upsertProfile(profile: Profile): Promise<Profile> {
  const { phone, name, email } = profile
  const ref = db.collection(COLLECTION).doc(phone)
  const doc = await ref.get()

  if (doc.exists) {
    await ref.update({
      name,
      email,
      updatedAt: FieldValue.serverTimestamp(),
    })
  } else {
    await ref.set({
      phone,
      name,
      email,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  return profile
}
