/**
 * Logger utility - Only logs in development mode
 * In production, logs are suppressed for security and performance
 */

const isDev = import.meta.env.DEV
const isProduction = import.meta.env.PROD

/**
 * Log info messages (only in development)
 */
export const log = (...args: any[]) => {
  if (isDev) {
    console.log(...args)
  }
}

/**
 * Log error messages (always logged, but can be sent to error tracking service)
 */
export const logError = (message: string, error?: any, context?: Record<string, any>) => {
  if (isDev) {
    console.error(`[ERROR] ${message}`, error, context || '')
  }
  
  // TODO: In production, send to error tracking service (Sentry, etc.)
  // if (isProduction && errorTrackingService) {
  //   errorTrackingService.captureException(error, { extra: context })
  // }
}

/**
 * Log warning messages (only in development)
 */
export const logWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args)
  }
}

/**
 * Log debug messages (only in development)
 */
export const logDebug = (...args: any[]) => {
  if (isDev) {
    console.debug(...args)
  }
}

/**
 * Log API requests (only in development)
 */
export const logRequest = (method: string, url: string, data?: any) => {
  if (isDev) {
    console.log(`📤 [${method.toUpperCase()}] ${url}`, data || '')
  }
}

/**
 * Log API responses (only in development)
 */
export const logResponse = (method: string, url: string, status: number, data?: any) => {
  if (isDev) {
    const emoji = status >= 200 && status < 300 ? '✅' : '❌'
    console.log(`${emoji} [${method.toUpperCase()}] ${url} - ${status}`, data || '')
  }
}

export default {
  log,
  logError,
  logWarn,
  logDebug,
  logRequest,
  logResponse,
}
