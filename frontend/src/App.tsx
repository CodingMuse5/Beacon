import { useQuery } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function useApiHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      return res.json() as Promise<{ status: string }>;
    },
    retry: false,
  });
}

function StatusDot({ color }: { color: "accent" | "warn" | "good" }) {
  const bg = { accent: "bg-accent", warn: "bg-warn", good: "bg-good" }[color];
  return (
    <span className="relative flex h-2 w-2">
      <span className={`motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full ${bg} opacity-75`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${bg}`} />
    </span>
  );
}

export default function App() {
  const { data, isLoading, isError } = useApiHealth();

  return (
    <div className="min-h-screen bg-ground flex items-center justify-center p-6">
      <div className="relative w-full max-w-md border border-border-soft bg-surface">
        <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-accent/60" />
        <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-accent/60" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-accent/60" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-accent/60" />

        <div className="p-8">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-2xl font-bold tracking-wide text-text">
              B<span className="text-accent">EACON</span>
            </h1>
          </div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-faint">
            Talent Signal Console
          </p>

          <div className="mt-6 border-t border-border-soft pt-6">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-faint">
              {isLoading && (
                <>
                  <StatusDot color="accent" />
                  <span>Establishing link…</span>
                </>
              )}
              {isError && (
                <>
                  <StatusDot color="warn" />
                  <span className="text-warn">Signal lost</span>
                </>
              )}
              {data && (
                <>
                  <StatusDot color="good" />
                  <span className="text-good">Signal locked</span>
                </>
              )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-text-dim">
              {isLoading && "Waiting on the backend's first response."}
              {isError && (
                <>
                  No response from <span className="font-mono text-text">{API_URL}</span>. Start it with{" "}
                  <code className="font-mono text-text">npm run dev</code> in <code className="font-mono text-text">backend/</code>.
                </>
              )}
              {data && (
                <>
                  Backend reporting status <span className="font-mono text-good">&quot;{data.status}&quot;</span>.
                </>
              )}
            </p>

            <p className="mt-4 font-mono text-[10.5px] text-text-faint">TARGET {API_URL}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
