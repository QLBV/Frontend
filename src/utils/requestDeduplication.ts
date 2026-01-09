/**
 * Request Deduplication Utility
 * Prevents duplicate requests from being sent simultaneously
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const CACHE_TTL = 1000; // 1 second

/**
 * Deduplicate requests - if same request is pending, return the existing promise
 * @param key - Unique key for the request
 * @param fn - Function that returns the request promise
 * @returns Promise that resolves with the request result
 */
export function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  // Clean up old requests
  for (const [k, v] of pendingRequests.entries()) {
    if (now - v.timestamp > CACHE_TTL) {
      pendingRequests.delete(k);
    }
  }

  // Check if request is already pending
  const pending = pendingRequests.get(key);
  if (pending && now - pending.timestamp < CACHE_TTL) {
    return pending.promise;
  }

  // Create new request
  const promise = fn().finally(() => {
    // Remove from cache after completion
    setTimeout(() => {
      pendingRequests.delete(key);
    }, CACHE_TTL);
  });

  pendingRequests.set(key, { promise, timestamp: now });
  return promise;
}

/**
 * Generate a unique key for a request
 * @param method - HTTP method
 * @param url - Request URL
 * @param data - Request data (optional)
 * @returns Unique key string
 */
export function generateRequestKey(
  method: string,
  url: string,
  data?: any
): string {
  const dataStr = data ? JSON.stringify(data) : "";
  return `${method}:${url}:${dataStr}`;
}
