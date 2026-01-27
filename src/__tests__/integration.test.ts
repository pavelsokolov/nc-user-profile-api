import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Express } from 'express'
import supertest from 'supertest'

const PROJECT_ID = 'demo-project'
const AUTH_EMULATOR = 'localhost:9099'
const FIRESTORE_EMULATOR = 'localhost:8081'
const TEST_PHONE = '+15551234567'

let app: Express
let request: ReturnType<typeof supertest>

async function getPhoneToken(phone: string): Promise<string> {
  // 1. Start phone sign-in via emulator REST
  const sendRes = await fetch(
    `http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, recaptchaToken: 'fake-token' }),
    },
  )
  const { sessionInfo } = (await sendRes.json()) as { sessionInfo: string }

  // 2. Fetch verification code from emulator
  const codesRes = await fetch(
    `http://${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/verificationCodes`,
  )
  const { verificationCodes } = (await codesRes.json()) as {
    verificationCodes: { phoneNumber: string; code: string; sessionInfo: string }[]
  }
  const entry = verificationCodes.find((c) => c.sessionInfo === sessionInfo)
  if (!entry) throw new Error('Verification code not found')

  // 3. Verify code to get ID token
  const verifyRes = await fetch(
    `http://${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionInfo: entry.sessionInfo, code: entry.code }),
    },
  )
  const { idToken } = (await verifyRes.json()) as { idToken: string }
  return idToken
}

beforeAll(async () => {
  process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR
  process.env.FIREBASE_AUTH_EMULATOR_HOST = AUTH_EMULATOR

  const mod = await import('../app.js')
  app = mod.default
  request = supertest(app)
})

afterAll(async () => {
  // Clean up Firestore documents
  await fetch(
    `http://${FIRESTORE_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  ).catch(() => {})

  // Clean up Auth accounts
  await fetch(`http://${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`, {
    method: 'DELETE',
  }).catch(() => {})
})

describe('Profile API integration', () => {
  let token: string

  it('returns 401 without auth', async () => {
    const res = await request.get('/profile')
    expect(res.status).toBe(401)
  })

  it('authenticates via phone and obtains token', async () => {
    token = await getPhoneToken(TEST_PHONE)
    expect(token).toBeTruthy()
  })

  it('GET /profile returns empty profile for new user', async () => {
    const res = await request.get('/profile').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ phone: TEST_PHONE, name: '', email: '' })
  })

  it('POST /profile saves profile data', async () => {
    const res = await request
      .post('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test User', email: 'test@example.com' })
    expect(res.status).toBe(200)
  })

  it('GET /profile returns saved data', async () => {
    const res = await request.get('/profile').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      phone: TEST_PHONE,
      name: 'Test User',
      email: 'test@example.com',
    })
  })

  it('POST /profile returns 400 for invalid data', async () => {
    const res = await request
      .post('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', email: 'bad' })
    expect(res.status).toBe(400)
  })
})
