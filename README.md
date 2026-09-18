# 🌍 SortCall

**Make the right call at the bin.** Snap a photo of any item and SortCall delivers a
contamination-aware disposal verdict — recycle, compost, landfill, e-waste, hazardous or
store drop-off — fused with region-specific rules, then tracks your personal impact.

Built for **NextStep Hacks 2026 — Earth Forward**.

## The problem

The #1 reason recycling fails isn't apathy — it's **wishcycling**. People toss questionable
items into the blue bin hoping they're recyclable, and contamination ruins entire batches.
The deciding factor is almost always *condition*: a clean pizza box recycles, a greasy one
ruins a bale of cardboard. No generic "what is this trash?" classifier answers that.

## What SortCall does differently

1. **Contamination verdict engine** — the AI assesses the item *and its condition*
   (clean / greasy / wet / broken / contains batteries), then a rule engine fuses
   item + condition + local rules into one final call.
2. **Local rules** — Generic US, San Francisco (three-cart system) and NYC (DSNY) rules with
   condition-level overrides (e.g., greasy pizza boxes compost in SF, landfill elsewhere).
3. **Impact tracking** — every sort logs to a private, on-device log with estimated CO₂e
   avoided, a 7-day chart, streaks, and a shareable impact card.
4. **SortLab** — a contamination playground: pick an item, see clean-vs-contaminated
   verdicts side by side, flip regions and watch calls change (greasy box → landfill in
   most of the US, compost in San Francisco). Works fully offline.
5. **Never-breaks demo** — three-tier fallback chain: Claude vision → offline rulebook →
   clear error handling, so the app always answers.

## Tech stack

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS**
- **Vercel AI SDK v7** (`generateObject` + Zod schema) with **Gemini 3.6 Flash** vision
  (free tier) — structured JSON verdicts, API key stays server-side
- **Rule engine** over a curated JSON dataset (20 conditional rules, 3 regions, CO₂e factors)
- **localStorage** impact log — no database, fully private

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Add `GOOGLE_GENERATIVE_AI_API_KEY` (free from [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
to `.env.local` to enable the AI path (the app works without it via the offline rulebook).
Deploy straight to Vercel.

## Project structure

```
src/
  app/
    page.tsx              # Snap & Sort flow + sample tiles
    lab/page.tsx          # SortLab contamination playground
    rulebook/page.tsx     # Searchable rulebook
    impact/page.tsx       # Impact dashboard + share card
    api/sort/route.ts     # Claude vision verdict + fallbacks
  components/             # Verdict card, badges, impact canvas, shell
  data/disposal-rules.json
  lib/                    # Verdict engine, impact log, types
```

## Disclaimer

Disposal guidance is educational and compiled from EPA and municipal program rules —
always confirm with your local waste authority.
