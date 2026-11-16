/**
 * Resolves with `fallback` when `promise` does not settle within `timeoutMs`.
 * Rejections also yield `fallback` so slow upstream APIs cannot block the page.
 */
export function promiseWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}
