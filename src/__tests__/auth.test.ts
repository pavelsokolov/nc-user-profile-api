import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const mockVerifyIdToken = vi.fn();

vi.mock('../firebase.js', () => ({
  auth: {
    verifyIdToken: (...args: unknown[]) => mockVerifyIdToken(...args),
  },
  db: {},
}));

function mockReqRes(authHeader?: string) {
  const req = {
    headers: { authorization: authHeader },
  } as AuthenticatedRequest;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('auth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no header', async () => {
    const { req, res, next } = mockReqRes();
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header is not Bearer', async () => {
    const { req, res, next } = mockReqRes('Basic abc');
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token is invalid', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('invalid'));
    const { req, res, next } = mockReqRes('Bearer badtoken');
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token has no phone number', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: '123' });
    const { req, res, next } = mockReqRes('Bearer validtoken');
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next and sets phoneNumber on success', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: '123', phone_number: '+1234567890' });
    const { req, res, next } = mockReqRes('Bearer validtoken');
    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.phoneNumber).toBe('+1234567890');
  });
});
