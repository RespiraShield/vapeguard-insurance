const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  log(...args: any[]): void {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: any[]): void {
    if (isDevelopment) {
      console.error(...args);
    } else if (isProduction) {
      // In production, you might want to send errors to a monitoring service
      // Example: Sentry.captureException(args[0]);
      console.error(...args);
    }
  }

  warn(...args: any[]): void {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args: any[]): void {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  debug(...args: any[]): void {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
}

export const logger = new Logger();
