/**
 * Safe client logger that outputs only in non-production environments
 * to prevent leaking internal traces or cluttering user consoles.
 */
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error('[App Error]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn('[App Warn]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info('[App Info]', ...args);
    }
  },
};
