export function Spinner() {
  return (
    <span
      className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-accent/30 border-t-accent motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}
