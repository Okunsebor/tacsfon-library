/**
 * lib/logger.ts
 *
 * Structured, leveled logger for production observability.
 * Uses the Pino-compatible JSON format on the server so logs can be
 * ingested by Datadog, Axiom, Vercel Log Drains, or any structured
 * logging platform without code changes.
 *
 * Falls back to console in development for a clean DX.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  return JSON.stringify({
    time: new Date().toISOString(),
    level,
    msg: message,
    service: 'tacsfon-library',
    ...context,
  });
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (IS_PRODUCTION) {
    // Structured JSON — ingested by log drain / APM platform
    const formatted = formatLog(level, message, context);
    if (level === 'error' || level === 'warn') {
      process.stderr.write(formatted + '\n');
    } else {
      process.stdout.write(formatted + '\n');
    }
  } else {
    // Pretty console output for local development
    const prefix = {
      debug: '🔍',
      info: '✅',
      warn: '⚠️ ',
      error: '🔴',
    }[level];

    const contextStr = context ? ' ' + JSON.stringify(context) : '';
    const method = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    method(`${prefix} [${level.toUpperCase()}] ${message}${contextStr}`);
  }
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => emit('debug', msg, ctx),
  info: (msg: string, ctx?: LogContext) => emit('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => emit('error', msg, ctx),

  /** Time a function and log its duration. Returns the result. */
  async timed<T>(label: string, fn: () => Promise<T>, ctx?: LogContext): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      emit('info', `${label} completed`, { ...ctx, durationMs: Date.now() - start });
      return result;
    } catch (err: any) {
      emit('error', `${label} failed`, { ...ctx, durationMs: Date.now() - start, error: err.message });
      throw err;
    }
  },
};
