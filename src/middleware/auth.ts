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
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    if (!decoded.phone_number) {
      res.status(401).json({ message: 'Token does not contain a phone number' });
      return;
    }
    req.phoneNumber = decoded.phone_number;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
