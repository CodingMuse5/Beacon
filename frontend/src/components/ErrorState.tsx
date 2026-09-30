import { ApiError } from "../api";

/**
 * Any 5xx renders as a calm, retryable card instead of raw backend error text -- the
 * backend already sanitizes what it sends for these (see each router's catch block), so
 * `error.message` is always safe to show directly. A 503 (cold-start retries exhausted)
 * gets a slightly more specific title, since that cause is actually known; anything else
 * gets a generic one, since claiming a specific cause we're not sure of would be dishonest.
 * A 4xx (bad input, e.g. "No file uploaded") shows as plain text with no retry button --
 * retrying identical input won't change the outcome.
 */
export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const status = error instanceof ApiError ? error.status : 0;

  if (status < 500) {
    return <p className="mt-4 text-sm text-warn">{error.message}</p>;
  }

  const title = status === 503 ? "Still waking up" : "Something went wrong";

  return (
    <div className="mt-4 flex flex-col gap-3 border border-accent/40 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-text-dim">{error.message}</p>
        </div>
      </div>
      <button
        type="button"
        className="self-start border border-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-accent transition-colors hover:bg-accent hover:text-ground"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}
