import { Request, Response, NextFunction } from 'express';
import { auth } from '../firebase.js';

export interface AuthenticatedRequest extends Request {
  phoneNumber?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token, true);
    if (!decoded.phone_number) {
      res.status(401).json({ error: 'Token does not contain a phone number' });
      return;
    }
    req.phoneNumber = decoded.phone_number;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
