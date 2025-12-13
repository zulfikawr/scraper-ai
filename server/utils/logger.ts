/**
 * Use an Enum for log levels to avoid magic strings and typos.
 */
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

/**
 * Define an interface.
 */
export interface LoggerService {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Formats the log message with a timestamp and level.
 */
function format(level: LogLevel, args: unknown[]): unknown[] {
  const timestamp = new Date().toISOString();
  const header = `[${timestamp}] [${level}]`;
  return [header, ...args];
}

export const logger: LoggerService = {
  info: (...args: unknown[]) => {
    console.log(...format(LogLevel.INFO, args));
  },
  warn: (...args: unknown[]) => {
    console.warn(...format(LogLevel.WARN, args));
  },
  error: (...args: unknown[]) => {
    console.error(...format(LogLevel.ERROR, args));
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(...format(LogLevel.DEBUG, args));
    }
  },
};

export default logger;
