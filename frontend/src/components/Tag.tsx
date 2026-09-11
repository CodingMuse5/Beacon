import type { ReactNode } from "react";

export function Tag({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "contact";
}) {
  const color = variant === "contact" ? "border-contact/40 text-contact" : "border-border text-text-dim";
  return <span className={`border px-1.5 py-0.5 font-mono text-[10px] tracking-wide ${color}`}>{children}</span>;
}
