import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getProfile, upsertProfile, Profile } from '../services/profile.js';
import { NAME_MAX_LENGTH, EMAIL_MAX_LENGTH, EMAIL_REGEX } from '../constants/validation.js';

export async function getProfileHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void>{
  try {
    const profile = await getProfile(req.phoneNumber!);
    res.status(200).json(profile);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function postProfileHandler(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void>{
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ message: 'Name must be a non-empty string' });
    return;
  }

  if (name.length > NAME_MAX_LENGTH) {
    res.status(400).json({ message: `Name must not exceed ${NAME_MAX_LENGTH} characters` });
    return;
  }

  if (
    !email ||
    typeof email !== 'string' ||
    !EMAIL_REGEX.test(email)
  ) {
    res.status(400).json({ message: 'Email must be a valid email address' });
    return;
  }

  if (email.length > EMAIL_MAX_LENGTH) {
    res.status(400).json({ message: `Email must not exceed ${EMAIL_MAX_LENGTH} characters` });
    return;
  }

  try {
    const profile: Profile = {
      phone: req.phoneNumber!,
      name: name.trim(),
      email: email.trim(),
    };
    const saved = await upsertProfile(profile);
    res.status(200).json(saved);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
}
