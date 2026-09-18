"use client";

import { useEffect, useState } from "react";
import { clearLog, computeStats, getLog, type ImpactStats } from "@/lib/impact-log";
import { downloadImpactCard } from "@/components/impact-card-canvas";
import { BinBadge } from "@/components/bin-badge";
import type { Bin } from "@/lib/types";

export default function ImpactPage() {
  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    setStats(computeStats(getLog()));
  }, []);

  if (!stats) return <p className="pt-10 text-center text-sm muted">Loading your impact…</p>;

  const maxCount = Math.max(1, ...stats.last7Days.map((d) => d.count));

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">My Impact</h1>
        <p className="mt-1 text-sm muted">Every sort you log adds up. This stays on your device.</p>
      </header>

      {stats.total === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-4xl">🌱</div>
          <p className="mt-2 font-semibold">Nothing logged yet</p>
          <p className="mt-1 text-sm muted">Sort your first item on the home page and your impact will grow here.</p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard big={`${stats.total}`} small="items sorted" />
            <StatCard big={`${stats.co2eKg.toFixed(1)} kg`} small="CO₂e avoided" accent />
            <StatCard big={`${stats.diverted}`} small="diverted from landfill" />
            <StatCard big={`${stats.streakDays} 🔥`} small="day streak" />
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider muted">Last 7 days</h2>
            <div className="mt-4 flex h-32 items-end gap-2">
              {stats.last7Days.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(d.count / maxCount) * 100}%`,
                      minHeight: d.count > 0 ? "8px" : "2px",
                      background: d.count > 0 ? "linear-gradient(180deg,#34d399,#14b8a6)" : "rgba(255,255,255,0.08)",
                    }}
                    title={`${d.count} sorted`}
                  />
                  <span className="text-xs muted">{d.day}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider muted">By destination</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.entries(stats.byBin) as [Bin, number][])
                .filter(([, n]) => n > 0)
                .map(([bin, n]) => (
                  <span key={bin} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm" style={{ borderColor: "var(--line)" }}>
                    <BinBadge bin={bin} size="sm" />× {n}
                  </span>
                ))}
            </div>
          </section>

          <section className="flex flex-wrap justify-center gap-3">
            <button className="btn-primary" onClick={() => downloadImpactCard(stats)}>
              ⬇️ Download impact card
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                if (confirm("Clear your entire impact log? This can't be undone.")) {
                  clearLog();
                  setStats(computeStats(getLog()));
                }
              }}
            >
              Clear log
            </button>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ big, small, accent }: { big: string; small: string; accent?: boolean }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-extrabold" style={accent ? { color: "var(--accent)" } : undefined}>
        {big}
      </div>
      <div className="mt-1 text-xs muted">{small}</div>
    </div>
  );
}
