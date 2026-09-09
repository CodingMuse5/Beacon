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

export default function App() {
  const { data, isLoading, isError } = useApiHealth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm max-w-md w-full">
        <h1 className="text-xl font-semibold text-slate-900">VStack — Talent Matching</h1>
        <p className="mt-2 text-sm text-slate-500">Phase 0 wiring check: frontend calling the Node backend.</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isLoading ? "bg-amber-400" : isError ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          {isLoading && <span>Checking backend…</span>}
          {isError && <span>Backend unreachable at {API_URL} — start it with `npm run dev` in backend/.</span>}
          {data && <span>Backend healthy: {data.status}</span>}
        </div>
      </div>
    </div>
  );
}
