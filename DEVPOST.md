> ## Devpost listing — SortCall (NextStep Hacks 2026 · Earth Forward)

**Title:** SortCall — the contamination-aware sorting coach

**Tagline:** Make the right call at the bin.

**Elevator pitch:** Recycling programs don't fail because people don't care — they fail
because of wishcycling. SortCall is the disposal coach that judges *condition, not just
category*: snap a photo and it tells you whether that pizza box recycles or ruins a bale
of cardboard, calls the bin with your region's rules, and logs the CO₂e you saved doing it.

---

### Inspiration

Every recycling facility operator says the same thing: contamination is the enemy. Roughly
1 in 4 items Americans "recycle" is actually trash — grease-soaked boxes, half-full cans,
plastic bags — and one bad item can downgrade an entire batch to landfill. The moment of
truth happens at the bin, in three seconds, with no guidance. That's the moment SortCall
was built for.

### What it does

- **Snap & Sort:** photograph (or describe) any item → get one clear verdict:
  Recycle · Compost · Landfill · E-Waste · Hazardous · Store drop-off — with a
  plain-language *why*.
- **Contamination verdict engine:** the same item gets different calls depending on
  condition. Clean pizza box → recycle. Greasy → landfill (compost in SF). That's the
  insight every "trash classifier" app misses.
- **Local rules:** Generic US curbside, San Francisco, and NYC rule sets — including
  condition-level overrides — because "is this recyclable?" has no universal answer.
- **Impact log:** every sort is logged privately on-device: items sorted, estimated kg of
  CO₂e avoided, a 7-day activity chart, a streak to keep you sorting, and a downloadable
  shareable impact card.
- **Searchable rulebook:** all 20 conditional rules — including the traps (coffee cups,
  chip bags, shredded paper) — readable even offline.
- **SortLab contamination playground:** pick an item and see clean-vs-contaminated verdicts
  side by side; flip between Generic US, San Francisco and NYC rules and watch the verdicts
  flip live — the app's thesis made interactive, and it works with zero network access.
- **Try-a-sample mode:** six curated scenarios, so anyone can test SortCall with no camera.

### How we built it

Next.js 14 + TypeScript + Tailwind. The verdict pipeline fuses three layers:

1. **Gemini 3.6 Flash vision** (via the Vercel AI SDK `generateObject` + a strict Zod
   schema) identifies the item, its condition, and a suggested bin — returning structured
   JSON, with the API key confined server-side.
2. **A deterministic rule engine** over a curated JSON dataset applies region-specific,
   condition-level overrides to finalize the call and compute CO₂e impact.
3. **A graceful degradation chain:** no API key or AI failure → the offline rulebook
   answers from keyword matching. The demo can't break on stage.

The impact log lives entirely in localStorage — private by design, no accounts, no tracking.

### Challenges we ran into

- Getting a vision model to return *verdict-grade* structured output (not chatty prose)
  — solved with a strict Zod schema so every verdict is machine-mergeable with the rule
  engine.
- Modeling contamination: building the rules dataset forced us to research actual
  municipal rules (SF composts greasy pizza boxes; NYC bans e-waste from trash) and encode
  condition-level logic instead of one answer per item.
- Designing honest fallbacks: we wanted the app to *always* answer — with a visible
  "rulebook mode" indicator rather than pretending the AI responded.

### Accomplishments we're proud of

- The clean-vs-greasy pizza box demo: one object, two bins, zero hand-waving.
- A fully working offline mode — judges can pull the network cable and it still works.
- Impact math on every single verdict, turning a one-off utility into a habit loop.

### What we learned

How recycling actually works (and breaks), how to fuse probabilistic AI output with
deterministic rule engines, and how to design AI features that degrade honestly instead
of failing silently.

### What's next for SortCall

- More regions (the rule set is data — contributors can add their city in one JSON file).
- Barcode + packaging-lookup support for ambiguous wrappers.
- Community mis-sort leaderboard for schools running zero-waste competitions.

---

### Built with

`next.js` `typescript` `tailwindcss` `vercel-ai-sdk` `gemini-3.6-flash` `zod`

---

## 🎬 5-minute demo video script

| Time | Beat | On screen | Say |
|------|------|-----------|-----|
| 0:00–0:30 | Hook | Hand hovering over two bins with a greasy pizza box | "Quick — recycling or trash? If you hesitated, you're like most people: one in four items Americans 'recycle' is actually garbage, and one greasy box can send an entire batch to landfill. This is wishcycling — and it's why recycling programs fail." |
| 0:30–1:30 | Live demo — the call | Phone: snap pizza box → verdict card | "SortCall. Snap a photo, three seconds. Grease-soaked cardboard: landfill — and here's the why, in plain language." Then describe "clean pizza box" → recycle. "Same item, different condition, different bin. That's the call no classifier makes — and it's the one that decides whether recycling actually works." |
| 1:30–2:20 | Rules + impact | **SortLab page**, then impact page | "Don't take our word for it — SortLab: same pizza box, two conditions, two different bins. Flip to San Francisco and the greasy box composts, because SF's green cart takes food-soiled paper. Every sort also logs CO₂e saved, builds a streak, and generates a shareable impact card." |
| 2:20–3:10 | Try a sample + resilience | Sample tiles; toggle airplane mode | "No camera? Six sample scenarios. And if the AI is unreachable, the offline rulebook takes over — the app never shows a dead end. Recycling help shouldn't require a signal." |
| 3:10–4:10 | Architecture | Brief code view | "Under the hood: Next.js, a strict Zod schema so the vision model returns machine-verdicts, a deterministic rule engine for regional overrides, and a three-tier fallback chain. The API key never leaves the server; your impact log never leaves your device." |
| 4:10–5:00 | Impact + close | Impact card download | "SortCall doesn't just answer a question — it builds a habit, one correct call at a time. Make the right call at the bin." |

**Judging criteria mapping:** Originality → contamination-verdict angle (not another classifier). Adherence → waste reduction is Earth Forward's core. Completion → working app + fallbacks. Learning → AI-SDK structured output, rule engines, multimodal prompting. Design → 3-tap mobile flow. Technology → multimodal AI fused with deterministic rules.
