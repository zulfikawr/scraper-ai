import * as util from "util";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.INFO]: COLORS.cyan,
  [LogLevel.WARN]: COLORS.yellow,
  [LogLevel.ERROR]: COLORS.red,
  [LogLevel.DEBUG]: COLORS.magenta,
};

export interface LoggerService {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Helper to format date as dd/mm/yyyy hh:mm:ss
 */
function getFormattedTimestamp(): string {
  const now = new Date();

  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();

  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");

  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}

/**
 * Formats the log message.
 * Structure: │ Timestamp │ Level │ Message
 */
function format(level: LogLevel, args: unknown[]): string {
  const timestamp = getFormattedTimestamp();

  // 1. Colorize and Pad Level (5 chars)
  const color = LEVEL_COLORS[level];
  const levelStr = `${color}${level.padEnd(5)}${COLORS.reset}`;

  // 2. Format the message
  const message = util.format(...args);

  // 3. Construct the table row
  // │ 14/12/2025 21:21:46 │ INFO  │ My Message Here
  return `${COLORS.dim}│ ${timestamp} │${COLORS.reset} ${levelStr} ${COLORS.dim}│${COLORS.reset} ${message}`;
}

export const logger: LoggerService = {
  info: (...args: unknown[]) => console.log(format(LogLevel.INFO, args)),
  warn: (...args: unknown[]) => console.warn(format(LogLevel.WARN, args)),
  error: (...args: unknown[]) => console.error(format(LogLevel.ERROR, args)),
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(format(LogLevel.DEBUG, args));
    }
  },
};

export default logger;
