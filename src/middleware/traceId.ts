import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export function traceIdMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const cloudTrace = req.headers['x-cloud-trace-context'];
  const traceId =
    typeof cloudTrace === 'string' ? cloudTrace.split('/')[0] : randomUUID();
  (req as Request & { traceId: string }).traceId = traceId;
  next();
}
