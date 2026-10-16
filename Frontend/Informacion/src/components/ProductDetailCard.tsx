import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { BadgeCheck, Leaf, Scale, Sprout, MapPin, Route, TreePine, ShieldCheck, ArrowRight, Fingerprint, HeartPulse, Syringe } from "lucide-react";

const TraceMap = lazy(() => import("./TraceMap"));

const MIN = 400, MAX = 420, SCALE_MIN = 350, SCALE_MAX = 470;
const pct = (v: number) => ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

const PADDOCKS = [
  { name: "La Aguada", stage: "Cría", months: "0–7 m" },
  { name: "El Monte", stage: "Recría", months: "7–14 m" },
  { name: "Los Sauces", stage: "Rotación", months: "14–20 m" },
  { name: "La Loma", stage: "Terminación", months: "20–26 m" },
];

export function ProductDetailCard() {
  const [tab, setTab] = useState<"origin" | "route">("origin");

  return (
    <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-card">
      {/* Header */}
      <header className="border-b p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <BadgeCheck className="h-3.5 w-3.5" /> Verificado SENASA
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Leaf className="h-3.5 w-3.5" /> Origen Sustentable
          </span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Aberdeen Angus Negro</h1>
        <p className="mt-2 text-muted-foreground">Novillo · 26 meses · Tandil, Buenos Aires</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 font-mono text-sm">
          <Fingerprint className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">ID Trazabilidad</span>
          <span className="font-semibold">AR-032-7741-0926</span>
        </div>
      </header>

      {/* Health & quality */}
      <section className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
        <div className="rounded-xl border bg-background p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Scale className="h-4 w-4 text-primary" /> Peso estimado
          </div>
          <p className="mt-2 font-display text-3xl font-semibold">{MIN} – {MAX} <span className="text-lg text-muted-foreground">kg</span></p>
          <div className="relative mt-5 h-2.5 rounded-full bg-muted">
            <div className="absolute inset-y-0 rounded-full bg-gradient-range" style={{ left: `${pct(MIN)}%`, width: `${pct(MAX) - pct(MIN)}%` }} />
            {[MIN, MAX].map((v) => (
              <span key={v} className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary" style={{ left: `${pct(v)}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{SCALE_MIN} kg</span><span>Rango óptimo de faena</span><span>{SCALE_MAX} kg</span>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-2 text-sm font-semibold opacity-80">
            <Sprout className="h-4 w-4" /> Alimentación
          </div>
          <p className="mt-2 font-display text-3xl font-semibold">100% Pastura Natural</p>
          <p className="mt-2 text-sm opacity-80">Pastoreo rotativo a campo abierto. Sin feedlot, sin hormonas, sin antibióticos promotores.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {["Grass-fed", "Omega-3 alto", "Agua de vertiente"].map((t) => (
              <span key={t} className="rounded-full border border-primary-foreground/30 px-2.5 py-1">{t}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-xl border bg-background px-5 py-4 sm:col-span-2">
          {[
            { icon: HeartPulse, label: "Bienestar", value: "Certificado" },
            { icon: Syringe, label: "Plan sanitario", value: "Completo" },
            { icon: ShieldCheck, label: "Libre de aftosa", value: "Con vacunación" },
          ].map(({ icon: I, label, value }) => (
            <div key={label} className="flex flex-1 items-center gap-3">
              <I className="h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold">{value}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Traceability */}
      <section className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Trazabilidad y sostenibilidad</h2>
          <div className="inline-flex rounded-lg border bg-muted p-1 text-sm">
            {([["origin", "Crianza responsable", MapPin], ["route", "Ruta de potreros", Route]] as const).map(([k, l, I]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition ${tab === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <I className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
        </div>

        <div className="relative isolate h-80 overflow-hidden rounded-xl border">
          <ClientOnly fallback={<div className="h-full animate-pulse bg-muted" />}>
            <Suspense fallback={<div className="h-full animate-pulse bg-muted" />}>
              <TraceMap key={tab} mode={tab} />
            </Suspense>
          </ClientOnly>

          {tab === "origin" ? (
            <div className="absolute bottom-3 left-3 z-[500] max-w-[15rem] rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary"><TreePine className="h-4 w-4" /> Índice Cero Deforestación</div>
              <p className="mt-1 font-display text-3xl font-semibold">100%</p>
              <p className="text-xs text-muted-foreground">Sin pérdida de cobertura nativa 2015–2026. Validado por imagen satelital.</p>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3 z-[500] rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur">
              <ol className="space-y-1.5 text-xs">
                {PADDOCKS.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-2">
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${i === 3 ? "bg-cta text-cta-foreground" : "bg-primary text-primary-foreground"}`}>{i + 1}</span>
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-muted-foreground">{p.stage} · {p.months}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {tab === "origin" ? "Estancia La Esperanza · 1.240 ha de pastizal pampeano." : "4 potreros · 26 meses · densidad < 1 animal/ha · rotación cada 45 días."}
        </p>
      </section>

      {/* CTA */}
      <footer className="flex flex-col gap-4 border-t bg-muted p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Precio estimado</p>
          <p className="font-display text-4xl font-semibold">US$ 1.890</p>
          <p className="text-xs text-muted-foreground">≈ US$ 4,60/kg vivo · Reserva con 10% de seña</p>
        </div>
        <button className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-cta px-8 py-4 text-lg font-bold text-cta-foreground shadow-cta transition hover:-translate-y-0.5">
          Reservar lote sustentable
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </button>
      </footer>
    </article>
  );
}
