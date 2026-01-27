import { Request, Response, NextFunction } from 'express'
import { auth } from '../firebase.js'
import { createLogger } from '../logger.js'

export interface AuthenticatedRequest extends Request {
  phoneNumber?: string
  traceId?: string
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const log = createLogger(req.traceId)
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    log.warn('Authentication failed: missing or invalid Authorization header')
    res.status(401).json({ message: 'Missing or invalid Authorization header' })
    return
  }

  const token = header.slice(7)
  try {
    const decoded = await auth.verifyIdToken(token)
    if (!decoded.phone_number) {
      log.warn('Authentication failed: token missing phone number')
      res.status(401).json({ message: 'Token does not contain a phone number' })
      return
    }
    req.phoneNumber = decoded.phone_number
    next()
  } catch {
    log.warn('Authentication failed: invalid or expired token')
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
