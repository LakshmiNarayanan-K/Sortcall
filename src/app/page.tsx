"use client";

import { useEffect, useRef, useState } from "react";
import regionsData from "@/data/disposal-rules.json";
import { VerdictCard } from "@/components/verdict-card";
import { addEntry } from "@/lib/impact-log";
import type { SortResponseBody, Verdict } from "@/lib/types";

const REGION_KEY = "sortcall-region";
const regions = (regionsData as { regions: { id: string; name: string }[] }).regions;
const samples = (regionsData as { demoSamples: { id: string; query: string; hint: string }[] }).demoSamples;

type Mode = "idle" | "thinking" | "result";

export default function SortPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("us-generic");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(REGION_KEY);
    if (saved) setRegion(saved);
  }, []);

  function pickRegion(id: string) {
    setRegion(id);
    window.localStorage.setItem(REGION_KEY, id);
  }

  async function sort(payload: { imageBase64?: string; mimeType?: string; query?: string; sample?: string }) {
    setMode("thinking");
    setError(null);
    setVerdict(null);
    if (payload.imageBase64) {
      setPreviewUrl(`data:${payload.mimeType ?? "image/jpeg"};base64,${payload.imageBase64}`);
    } else {
      setPreviewUrl(null);
    }
    try {
      const res = await fetch("/api/sort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, region }),
      });
      const data = (await res.json()) as SortResponseBody;
      if (!res.ok || !data.ok || !data.verdict) {
        setError(
          data.error ??
            (data.ok
              ? "That one stumped the rulebook — try a few more words, like 'greasy pizza box'."
              : "Something went wrong. Try again.")
        );
        setMode("idle");
        return;
      }
      setVerdict(data.verdict);
      setDegraded(Boolean(data.degraded));
      setMode("result");
      addEntry({
        ts: Date.now(),
        item: data.verdict.item,
        bin: data.verdict.bin,
        co2eKg: data.verdict.co2eKg,
      });
    } catch {
      setError("Network hiccup — check your connection and try again.");
      setMode("idle");
    }
  }

  async function onFile(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    const base64 = dataUrl.split(",")[1] ?? "";
    sort({ imageBase64: base64, mimeType: file.type || "image/jpeg" });
  }

  function onSample(id: string) {
    const s = samples.find((x) => x.id === id);
    if (s) sort({ sample: s.query, query: s.query });
  }

  return (
    <div className="space-y-6">
      <section className="pt-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Make the right call <span style={{ color: "var(--accent)" }}>at the bin</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm muted">
          Snap any item. SortCall judges its condition — clean vs contaminated — and calls the bin with your local rules.
        </p>
      </section>

      <section className="card p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="muted">Region:</span>
          <select className="field max-w-56" value={region} onChange={(e) => pickRegion(e.target.value)} aria-label="Disposal region">
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button className="btn-primary pulse-ring" onClick={() => cameraRef.current?.click()} disabled={mode === "thinking"}>
            📷 Snap an item
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={mode === "thinking"}>
            🖼️ Upload photo
          </button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) sort({ query: query.trim() });
          }}
        >
          <input
            className="field"
            placeholder="…or describe it: 'greasy pizza box'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Describe the item"
          />
          <button className="btn-primary" type="submit" disabled={mode === "thinking" || !query.trim()}>
            Sort
          </button>
        </form>
      </section>

      {mode === "thinking" && (
        <section className="card flex items-center gap-4 p-5 fade-up">
          <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <div>
            <div className="font-semibold">Judging the evidence…</div>
            <div className="text-sm muted">Checking condition against local disposal rules</div>
          </div>
        </section>
      )}

      {error && (
        <section className="card p-5 text-sm" style={{ borderColor: "#f87171" }}>
          ⚠️ {error}
        </section>
      )}

      {mode === "result" && verdict && (
        <>
          {degraded && (
            <p className="text-center text-xs" style={{ color: "#fbbf24" }}>
              ⚡ AI vision is offline — answered from the SortCall rulebook instead.
            </p>
          )}
          {previewUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Item you sorted" className="max-h-44 rounded-xl border object-cover" style={{ borderColor: "var(--line)" }} />
            </div>
          )}
          <VerdictCard
            verdict={verdict}
            onSortAgain={() => {
              setMode("idle");
              setVerdict(null);
              setPreviewUrl(null);
              setQuery("");
            }}
          />
        </>
      )}

      {mode === "idle" && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider muted">Try a sample — no camera needed</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {samples.map((s) => (
              <button key={s.id} onClick={() => onSample(s.id)} className="card p-3 text-left text-sm transition hover:brightness-125">
                <div className="font-semibold">{s.hint}</div>
                <div className="truncate text-xs muted">{s.query}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-sm muted">
            Curious why verdicts flip? Open{" "}
            <a href="/lab" className="font-semibold underline" style={{ color: "var(--accent)" }}>
              SortLab
            </a>{" "}
            — the contamination playground.
          </p>
        </section>
      )}
    </div>
  );
}

