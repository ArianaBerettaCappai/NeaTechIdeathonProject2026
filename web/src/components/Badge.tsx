import type { Nivel } from "../types";

const CLASE: Record<Nivel, string> = {
  ok: "tag-ok",
  warn: "tag-warn",
  bad: "tag-bad",
  neutral: "tag-neutral",
};

export function Badge({ nivel, children }: { nivel: Nivel; children: React.ReactNode }) {
  return <span className={`tag ${CLASE[nivel]}`}>{children}</span>;
}
