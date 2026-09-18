"use client";

import { useMemo, useState } from "react";
import rulesData from "@/data/disposal-rules.json";
import { verdictFromRule } from "@/lib/verdict";
import { BinBadge } from "@/components/bin-badge";
import type { Bin } from "@/lib/types";

interface Region {
  id: string;
  name: string;
}
interface Rule {
  id: string;
  item: string;
  category: string;
  clean: { bin: Bin };
  contaminated: { bin: Bin };
  ruleTitle?: string;
}

const regions = (rulesData as { regions: Region[] }).regions;
const regionNotes = (rulesData as { regionNotes: Record<string, string> }).regionNotes;
const allRules = (rulesData as { baseRules: Rule[] }).baseRules;

/** Items whose verdict actually changes with condition or region — the flip-worthy ones. */
const flipItems = allRules.filter((r) => {
  const hasConditionFlip = r.clean.bin !== r.contaminated.bin;
  const hasRegionFlip = (rulesData as unknown as {
    regionOverrides: { ruleId: string }[];
  }).regionOverrides.some((o) => o.ruleId === r.id);
  return hasConditionFlip || hasRegionFlip;
});

export default function LabPage() {
  const [itemId, setItemId] = useState("pizza-box");
  const [region, setRegion] = useState("us-generic");

  const clean = useMemo(() => verdictFromRule(itemId, "clean", region), [itemId, region]);
  const contaminated = useMemo(() => verdictFromRule(itemId, "contaminated", region), [itemId, region]);

  const regionFlip = useMemo(
    () =>
      regions.map((r) => ({
        region: r,
        verdict: verdictFromRule(itemId, "contaminated", r.id),
      })),
    [itemId]
  );

  const binsDiffer = clean && contaminated && clean.bin !== contaminated.bin;
  const activeRule = allRules.find((r) => r.id === itemId);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Sort<span style={{ color: "var(--accent)" }}>Lab</span>
        </h1>
        <p className="mt-1 text-sm muted">
          The contamination playground. Same item, two conditions, three regions — watch the
          verdict flip. This is the brain SortCall brings to every sort.
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider muted">Pick an item</h2>
        <div className="flex flex-wrap gap-2">
          {flipItems.map((r) => (
            <button
              key={r.id}
              onClick={() => setItemId(r.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                itemId === r.id ? "" : "hover:bg-white/5"
              }`}
              style={
                itemId === r.id
                  ? { borderColor: "var(--accent)", background: "rgba(52,211,153,0.12)", color: "var(--accent)" }
                  : { borderColor: "var(--line)" }
              }
            >
              {r.item}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2 text-sm">
        <span className="muted">Rules for:</span>
        <select className="field max-w-56" value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </section>

      {clean && contaminated && (
        <section className="grid gap-3 sm:grid-cols-2">
          <VerdictPane label="Condition: clean & dry" verdict={clean} highlight={Boolean(binsDiffer)} />
          <VerdictPane label="Condition: contaminated" verdict={contaminated} highlight={Boolean(binsDiffer)} />
        </section>
      )}

      {binsDiffer && (
        <p className="text-center text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ⚡ Same item — different bins. Condition is the whole ballgame.
        </p>
      )}

      <section className="card p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider muted">
          How regions call the contaminated version
        </h2>
        <div className="mt-3 space-y-2">
          {regionFlip.map(({ region: r, verdict }) => (
            <div key={r.id} className="flex items-center justify-between gap-3 text-sm">
              <span className={r.id === region ? "font-semibold" : "muted"}>{r.name}</span>
              {verdict && <BinBadge bin={verdict.bin} size="sm" />}
            </div>
          ))}
        </div>
        {regionNotes[region] && (
          <p className="mt-3 border-t pt-3 text-xs muted" style={{ borderColor: "var(--line)" }}>
            📍 {regionNotes[region]}
          </p>
        )}
      </section>

      {activeRule?.ruleTitle && (
        <p className="text-center text-sm muted">
          📖 <strong style={{ color: "var(--text)" }}>{activeRule.ruleTitle}</strong> — one of{" "}
          {allRules.length} rules in the SortCall rulebook.
        </p>
      )}
    </div>
  );
}

function VerdictPane({
  label,
  verdict,
  highlight,
}: {
  label: string;
  verdict: { bin: Bin; reasoning: string; condition: string; co2eKg: number };
  highlight: boolean;
}) {
  return (
    <div
      className="card p-4 transition"
      style={highlight ? { borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent)" } : undefined}
    >
      <div className="text-xs font-bold uppercase tracking-wider muted">{label}</div>
      <div className="mt-3">
        <BinBadge bin={verdict.bin} size="lg" />
      </div>
      <p className="mt-3 text-sm leading-relaxed">{verdict.reasoning}</p>
      <div className="mt-3 text-xs muted">
        Impact if sorted this way: <strong style={{ color: "var(--text)" }}>+{verdict.co2eKg.toFixed(2)} kg CO₂e</strong>
      </div>
    </div>
  );
}
