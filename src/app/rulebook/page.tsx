"use client";

import { useMemo, useState } from "react";
import rulesData from "@/data/disposal-rules.json";
import { BinBadge } from "@/components/bin-badge";
import type { Bin } from "@/lib/types";

interface VariantRule {
  bin: Bin;
  reasoning: string;
}
interface Rule {
  id: string;
  item: string;
  category: string;
  clean: VariantRule;
  contaminated: VariantRule;
  ruleTitle?: string;
  ruleDetail?: string;
}

const rules = (rulesData as { baseRules: Rule[]; regionNotes: Record<string, string> }).baseRules;
const regionNotes = (rulesData as { regionNotes: Record<string, string> }).regionNotes;

export default function RulebookPage() {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return rules.filter(
      (r) =>
        r.item.toLowerCase().includes(needle) ||
        r.category.toLowerCase().includes(needle) ||
        (r.ruleTitle ?? "").toLowerCase().includes(needle)
    );
  }, [q]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">The Rulebook</h1>
        <p className="mt-1 text-sm muted">
          The same brain SortCall uses offline — {rules.length} conditional rules, including the traps. Tap a rule for the clean-vs-contaminated split.
        </p>
      </header>

      <input className="field" placeholder="Search items… (pizza, battery, cup)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search rules" />

      <div className="space-y-2">
        {filtered.map((r) => {
          const open = openId === r.id;
          return (
            <div key={r.id} className="card overflow-hidden">
              <button className="flex w-full items-center justify-between gap-3 p-4 text-left" onClick={() => setOpenId(open ? null : r.id)}>
                <div>
                  <div className="font-semibold">{r.item}</div>
                  <div className="text-xs muted">{r.category}{r.ruleTitle ? ` · ${r.ruleTitle}` : ""}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <BinBadge bin={r.clean.bin} size="sm" />
                  {r.clean.bin !== r.contaminated.bin && <BinBadge bin={r.contaminated.bin} size="sm" />}
                  <span aria-hidden className="muted">{open ? "▲" : "▼"}</span>
                </div>
              </button>
              {open && (
                <div className="space-y-3 border-t px-4 py-4 text-sm" style={{ borderColor: "var(--line)" }}>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>If clean</div>
                    <p className="mt-1">{r.clean.reasoning}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#f87171" }}>If contaminated</div>
                    <p className="mt-1">{r.contaminated.reasoning}</p>
                  </div>
                  {r.ruleDetail && <p className="muted">💡 {r.ruleDetail}</p>}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="py-8 text-center text-sm muted">No rules match “{q}” — but the AI path can still call it.</p>}
      </div>

      <section className="card p-4 text-sm">
        <h2 className="font-bold" style={{ color: "var(--accent)" }}>Regional notes</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 muted">
          {Object.entries(regionNotes).map(([id, note]) => (
            <li key={id}>{note}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
