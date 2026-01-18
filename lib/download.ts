import { retryWithBackoff } from "./retry";

class RetryableResponseError extends Error {
  response: Response;

  constructor(response: Response) {
    super(`Retryable response: ${response.status}`);
    this.response = response;
  }
}

const shouldRetryDownload = (error: unknown) => {
  if (error instanceof RetryableResponseError) {
    return error.response.status === 429;
  }
  return false;
};

export const downloadWithRetry = async ({
  url,
  filename,
  signal,
}: {
  url: string;
  filename: string;
  signal?: AbortSignal;
}) => {
  const response = await retryWithBackoff(
    async () => {
      const res = await fetch(url, { signal });
      if (res.status === 429) {
        throw new RetryableResponseError(res);
      }
      if (!res.ok) {
        throw new Error(`Download failed (${res.status})`);
      }
      return res;
    },
    { shouldRetry: shouldRetryDownload, signal }
  );

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};
