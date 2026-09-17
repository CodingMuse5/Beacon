import { ApiError } from "../api";

/**
 * Renders a friendlier "the service is still waking up" card for a 503 (Render
 * free-tier cold start exhausted all retries) instead of dumping a raw error message on
 * screen -- with a one-click retry, since the fix here really is just "try again."
 * Any other error still shows as plain text: that's a real failure worth reading, not a
 * transient one worth hiding.
 */
export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const isWakingUp = error instanceof ApiError && error.status === 503;

  if (!isWakingUp) {
    return <p className="mt-4 text-sm text-warn">{error.message}</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 border border-accent/40 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent">Still waking up</p>
          <p className="mt-1 text-sm leading-relaxed text-text-dim">
            The AI service is booting up after a period of inactivity — this can take up to a minute the first time.
          </p>
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
