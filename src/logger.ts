type Severity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

const SEVERITY_ORDER: Record<Severity, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

function shouldLog(level: Severity, minLevel: Severity): boolean {
  return SEVERITY_ORDER[level] >= SEVERITY_ORDER[minLevel]
}

function getMinLevel(): Severity {
  const env = (process.env.LOG_LEVEL ?? 'INFO').toUpperCase()
  if (env in SEVERITY_ORDER) return env as Severity
  return 'INFO'
}

function log(severity: Severity, message: string, data?: Record<string, unknown>): void {
  if (!shouldLog(severity, getMinLevel())) return
  const entry = {
    timestamp: new Date().toISOString(),
    severity,
    message,
    ...data,
  }
  console.log(JSON.stringify(entry))
}

export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void
  info(message: string, data?: Record<string, unknown>): void
  warn(message: string, data?: Record<string, unknown>): void
  error(message: string, data?: Record<string, unknown>): void
}

export function createLogger(traceId?: string): Logger {
  const base = traceId ? { traceId } : {}
  return {
    debug: (msg, data) => log('DEBUG', msg, { ...base, ...data }),
    info: (msg, data) => log('INFO', msg, { ...base, ...data }),
    warn: (msg, data) => log('WARN', msg, { ...base, ...data }),
    error: (msg, data) => log('ERROR', msg, { ...base, ...data }),
  }
}

export const logger = createLogger()
