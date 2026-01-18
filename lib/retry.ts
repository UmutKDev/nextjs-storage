type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown) => boolean;
  signal?: AbortSignal;
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("aborted"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(signal.reason ?? new Error("aborted"));
        },
        { once: true }
      );
    }
  });

export const retryWithBackoff = async <T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
) => {
  const {
    maxAttempts = 4,
    baseDelayMs = 500,
    maxDelayMs = 5000,
    jitter = true,
    shouldRetry = () => false,
    signal,
  } = options;

  let attempt = 0;
  while (true) {
    try {
      return await fn(attempt + 1);
    } catch (error) {
      attempt += 1;
      const canRetry = attempt < maxAttempts && shouldRetry(error);
      if (!canRetry) {
        throw error;
      }
      const rawDelay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const delay = jitter ? rawDelay * (0.6 + Math.random() * 0.8) : rawDelay;
      await sleep(delay, signal);
    }
  }
};
