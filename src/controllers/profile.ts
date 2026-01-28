import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { getProfile, upsertProfile } from '../services/profile.js'
import { profileBodySchema } from '../schemas/profile.js'
import { AppError } from '../errors/AppError.js'

export async function getProfileHandler(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await getProfile(req.phoneNumber!)
    _res.status(200).json(profile)
  } catch (error) {
    next(error)
  }
}

export async function postProfileHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const result = profileBodySchema.safeParse(req.body)
  if (!result.success) {
    next(new AppError(result.error.issues[0].message, 400))
    return
  }

  try {
    const saved = await upsertProfile({
      phone: req.phoneNumber!,
      name: result.data.name,
      email: result.data.email,
    })
    res.status(200).json(saved)
  } catch (error) {
    next(error)
  }
}
