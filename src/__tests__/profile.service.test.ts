import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.fn()
const mockSet = vi.fn()
const mockUpdate = vi.fn()
const mockDoc = vi.fn(() => ({
  get: mockGet,
  set: mockSet,
  update: mockUpdate,
}))
const mockCollection = vi.fn((_name: string) => ({ doc: mockDoc }))

vi.mock('../firebase.js', () => ({
  db: {
    collection: (name: string) => mockCollection(name),
  },
  auth: {},
}))

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => 'TIMESTAMP',
  },
}))

import { getProfile, upsertProfile } from '../services/profile.js'

describe('profile service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty profile when doc does not exist', async () => {
    mockGet.mockResolvedValue({ exists: false })
    const result = await getProfile('+1234')
    expect(result).toEqual({ phone: '+1234', name: '', email: '' })
    expect(mockCollection).toHaveBeenCalledWith('users')
    expect(mockDoc).toHaveBeenCalledWith('+1234')
  })

  it('returns existing profile', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ phone: '+1234', name: 'John', email: 'j@e.com' }),
    })
    const result = await getProfile('+1234')
    expect(result).toEqual({ phone: '+1234', name: 'John', email: 'j@e.com' })
  })

  it('creates new profile when doc does not exist', async () => {
    mockGet.mockResolvedValue({ exists: false })
    mockSet.mockResolvedValue(undefined)
    await upsertProfile({ phone: '+1234', name: 'John', email: 'j@e.com' })
    expect(mockSet).toHaveBeenCalledWith({
      phone: '+1234',
      name: 'John',
      email: 'j@e.com',
      createdAt: 'TIMESTAMP',
      updatedAt: 'TIMESTAMP',
    })
  })

  it('updates existing profile', async () => {
    mockGet.mockResolvedValue({ exists: true })
    mockUpdate.mockResolvedValue(undefined)
    await upsertProfile({ phone: '+1234', name: 'Jane', email: 'jane@e.com' })
    expect(mockUpdate).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@e.com',
      updatedAt: 'TIMESTAMP',
    })
  })

  it('throws when Firestore get fails in getProfile', async () => {
    mockGet.mockRejectedValue(new Error('Firestore unavailable'))
    await expect(getProfile('+1234')).rejects.toThrow('Firestore unavailable')
  })

  it('throws when Firestore set fails in upsertProfile', async () => {
    mockGet.mockResolvedValue({ exists: false })
    mockSet.mockRejectedValue(new Error('Write failed'))
    await expect(upsertProfile({ phone: '+1234', name: 'John', email: 'j@e.com' })).rejects.toThrow(
      'Write failed',
    )
  })

  it('throws when Firestore update fails in upsertProfile', async () => {
    mockGet.mockResolvedValue({ exists: true })
    mockUpdate.mockRejectedValue(new Error('Update failed'))
    await expect(upsertProfile({ phone: '+1234', name: 'John', email: 'j@e.com' })).rejects.toThrow(
      'Update failed',
    )
  })
})
