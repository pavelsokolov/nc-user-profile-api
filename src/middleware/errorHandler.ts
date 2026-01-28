import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError.js'
import { createLogger } from '../logger.js'

interface AuthenticatedLike extends Request {
  traceId?: string
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const traceId = (req as AuthenticatedLike).traceId
  const log = createLogger(traceId)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  log.error('Unhandled error', {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  })
  res.status(500).json({ message: 'Internal server error' })
}
