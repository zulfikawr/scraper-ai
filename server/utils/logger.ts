function format(level: string, args: any[]) {
  const header = `[${level}]`;
  return [header, ...args];
}

export const logger = {
  info: (...args: any[]) => {
    console.log(...format("INFO", args));
  },
  warn: (...args: any[]) => {
    console.warn(...format("WARN", args));
  },
  error: (...args: any[]) => {
    console.error(...format("ERROR", args));
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(...format("DEBUG", args));
    }
  },
};

export default logger;
