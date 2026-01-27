import { Request, Response, NextFunction } from 'express'
import { createLogger } from '../logger.js'

export function requestLogMiddleware(
  req: Request & { traceId?: string },
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const log = createLogger(req.traceId)
    const data = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
    }

    if (res.statusCode >= 500) {
      log.error('Request completed', data)
    } else if (res.statusCode >= 400) {
      log.warn('Request completed', data)
    } else {
      log.info('Request completed', data)
    }
  })

  next()
}
