import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Response, NextFunction } from 'express'
import { postProfileHandler, getProfileHandler } from '../controllers/profile.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { NAME_MAX_LENGTH, EMAIL_MAX_LENGTH } from '../constants/validation.js'
import { AppError } from '../errors/AppError.js'

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

function mockReqResNext(body: Record<string, unknown>) {
  const req = { body, phoneNumber: '+1234' } as AuthenticatedRequest
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  const next = vi.fn() as unknown as NextFunction
  return { req, res, next }
}

describe('POST /profile validation', () => {
  it('rejects missing name', async () => {
    const { req, res, next } = mockReqResNext({ email: 'a@b.com' })
    await postProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0].statusCode).toBe(400)
  })

  it('rejects empty name', async () => {
    const { req, res, next } = mockReqResNext({ name: '', email: 'a@b.com' })
    await postProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0].statusCode).toBe(400)
  })

  it('rejects missing email', async () => {
    const { req, res, next } = mockReqResNext({ name: 'John' })
    await postProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0].statusCode).toBe(400)
  })

  it('rejects invalid email', async () => {
    const { req, res, next } = mockReqResNext({ name: 'John', email: 'notanemail' })
    await postProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0].statusCode).toBe(400)
  })

  it(`rejects name exceeding ${NAME_MAX_LENGTH} characters`, async () => {
    const { req, res, next } = mockReqResNext({
      name: 'a'.repeat(NAME_MAX_LENGTH + 1),
      email: 'a@b.com',
    })
    await postProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0].statusCode).toBe(400)
  })

  it(`rejects email exceeding ${EMAIL_MAX_LENGTH} characters`, async () => {
    const { req, res, next } = mockReqResNext({
      name: 'John',
      email: 'a'.repeat(EMAIL_MAX_LENGTH - 8) + '@test.com',
    })
    await postProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0].statusCode).toBe(400)
  })

  it('accepts valid input', async () => {
    const { req, res, next } = mockReqResNext({ name: 'John', email: 'john@example.com' })
    await postProfileHandler(req, res, next)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('calls next with error when upsertProfile throws', async () => {
    mockUpsertProfile.mockRejectedValueOnce(new Error('Firestore down'))
    const { req, res, next } = mockReqResNext({ name: 'John', email: 'john@example.com' })
    await postProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
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
    const next = vi.fn() as unknown as NextFunction
    await getProfileHandler(req, res, next)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ phone: '+1234', name: 'John', email: 'j@e.com' })
  })

  it('calls next with error when getProfile throws', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('Firestore down'))
    const req = { phoneNumber: '+1234' } as AuthenticatedRequest
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response
    const next = vi.fn() as unknown as NextFunction
    await getProfileHandler(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})
