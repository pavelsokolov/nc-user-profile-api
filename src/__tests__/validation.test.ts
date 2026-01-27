import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { postProfileHandler, getProfileHandler } from '../controllers/profile.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { NAME_MAX_LENGTH, EMAIL_MAX_LENGTH } from '../constants/validation.js'

const mockUpsertProfile = vi
  .fn()
  .mockResolvedValue({ phone: '+1234', name: 'Test', email: 'test@test.com' })
const mockGetProfile = vi.fn().mockResolvedValue({ phone: '+1234', name: '', email: '' })

vi.mock('../services/profile.js', () => ({
  upsertProfile: (...args: unknown[]) => mockUpsertProfile(...args),
  getProfile: (...args: unknown[]) => mockGetProfile(...args),
}))

vi.mock('../firebase.js', () => ({
  db: {},
  auth: {},
}))

function mockReqRes(body: Record<string, unknown>) {
  const req = { body, phoneNumber: '+1234' } as AuthenticatedRequest
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return { req, res }
}

describe('POST /profile validation', () => {
  it('rejects missing name', async () => {
    const { req, res } = mockReqRes({ email: 'a@b.com' })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects empty name', async () => {
    const { req, res } = mockReqRes({ name: '', email: 'a@b.com' })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects missing email', async () => {
    const { req, res } = mockReqRes({ name: 'John' })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects invalid email', async () => {
    const { req, res } = mockReqRes({ name: 'John', email: 'notanemail' })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it(`rejects name exceeding ${NAME_MAX_LENGTH} characters`, async () => {
    const { req, res } = mockReqRes({ name: 'a'.repeat(NAME_MAX_LENGTH + 1), email: 'a@b.com' })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it(`rejects email exceeding ${EMAIL_MAX_LENGTH} characters`, async () => {
    const { req, res } = mockReqRes({
      name: 'John',
      email: 'a'.repeat(EMAIL_MAX_LENGTH - 8) + '@test.com',
    })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('accepts valid input', async () => {
    const { req, res } = mockReqRes({ name: 'John', email: 'john@example.com' })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('returns 500 when upsertProfile throws', async () => {
    mockUpsertProfile.mockRejectedValueOnce(new Error('Firestore down'))
    const { req, res } = mockReqRes({ name: 'John', email: 'john@example.com' })
    await postProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' })
  })
})

describe('GET /profile controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns profile on success', async () => {
    mockGetProfile.mockResolvedValueOnce({ phone: '+1234', name: 'John', email: 'j@e.com' })
    const req = { phoneNumber: '+1234' } as AuthenticatedRequest
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response
    await getProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ phone: '+1234', name: 'John', email: 'j@e.com' })
  })

  it('returns 500 when getProfile throws', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('Firestore down'))
    const req = { phoneNumber: '+1234' } as AuthenticatedRequest
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response
    await getProfileHandler(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' })
  })
})
