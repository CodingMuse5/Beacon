import crypto from "node:crypto";

// Whitespace is collapsed so the same text re-pasted with different line wrapping or
// trailing spaces still counts as identical.
export function contentHashOf(...parts: string[]): string {
  const normalized = parts.map((p) => p.trim().replace(/\s+/g, " ")).join("\n");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
