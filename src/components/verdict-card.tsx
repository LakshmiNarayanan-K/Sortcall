"use client";

import { useState } from "react";
import type { Verdict } from "@/lib/types";
import { BinBadge } from "@/components/bin-badge";

const SOURCE_LABEL: Record<Verdict["source"], string> = {
  ai: "AI vision verdict",
  rulebook: "Rulebook match",
  demo: "Sample",
};

export function VerdictCard({ verdict, onSortAgain }: { verdict: Verdict; onSortAgain?: () => void }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const text = `I just sorted a ${verdict.item} with SortCall — verdict: ${verdict.bin.toUpperCase()}. 🌍 Make the right call at the bin.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "SortCall", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed share sheet */
    }
  }

  return (
    <div className="card fade-up overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}
      >
        <span>{SOURCE_LABEL[verdict.source]}</span>
        <span>{Math.round(verdict.confidence * 100)}% confident</span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BinBadge bin={verdict.bin} size="lg" />
          <div className="text-right text-xs muted">
            <div className="font-semibold" style={{ color: "var(--text)" }}>
              {verdict.item}
            </div>
            <div>{verdict.condition}</div>
          </div>
        </div>

        <div className="rounded-xl border p-4 text-sm leading-relaxed" style={{ borderColor: "var(--line)", background: "rgba(4,18,13,0.5)" }}>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Why
          </span>
          {verdict.reasoning}
        </div>

        {verdict.ruleTitle && (
          <div className="rounded-xl border border-dashed p-4 text-sm" style={{ borderColor: "var(--line)" }}>
            <div className="font-semibold" style={{ color: "var(--accent)" }}>
              📖 {verdict.ruleTitle}
            </div>
            <div className="mt-1 muted">{verdict.ruleDetail}</div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="muted">
            Logged impact: <strong style={{ color: "var(--text)" }}>+{verdict.co2eKg.toFixed(2)} kg CO₂e</strong> avoided
          </span>
          <div className="flex gap-2">
            <button onClick={share} className="btn-ghost">
              {copied ? "Copied!" : "Share"}
            </button>
            {onSortAgain && (
              <button onClick={onSortAgain} className="btn-primary">
                Sort another
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
