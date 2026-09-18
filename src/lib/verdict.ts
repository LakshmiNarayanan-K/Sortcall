import rulesData from "@/data/disposal-rules.json";
import type { Bin, Verdict } from "@/lib/types";

interface VariantRule {
  bin: Bin;
  reasoning: string;
}

interface BaseRule {
  id: string;
  item: string;
  category: string;
  keywords: string[];
  clean: VariantRule;
  contaminated: VariantRule;
  ruleTitle?: string;
  ruleDetail?: string;
}

interface RuleOverride {
  regionId: string;
  ruleId: string;
  clean?: VariantRule;
  contaminated?: VariantRule;
}

interface RulesFile {
  meta: { source: string; lastUpdated: string };
  co2ePerItemKg: Record<Bin, number>;
  regions: { id: string; name: string; aliases: string[] }[];
  regionNotes: Record<string, string>;
  baseRules: BaseRule[];
  regionOverrides: RuleOverride[];
  demoSamples: { id: string; query: string; hint: string }[];
}

const rules = rulesData as unknown as RulesFile;

export function getRegions() {
  return rules.regions;
}

export function getDemoSamples() {
  return rules.demoSamples;
}

export function getRegionNote(regionId: string) {
  return rules.regionNotes[regionId] ?? rules.meta.source;
}

export function co2eForBin(bin: Bin): number {
  return rules.co2ePerItemKg[bin] ?? 0;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

/** Score a query against a rule's keywords. Longer keywords carry more weight. */
function scoreRule(query: string, rule: BaseRule): number {
  let score = 0;
  for (const kw of rule.keywords) {
    const n = normalize(kw);
    if (!n) continue;
    const isWholeWord = n.length <= 4;
    if (isWholeWord) {
      if (new RegExp(`\\b${n.replace(/-/g, "\\-")}\\b`).test(query)) {
        score += n.length;
      }
    } else if (query.includes(n)) {
      score += n.length;
    }
  }
  return score;
}

export function matchRule(query: string): { rule: BaseRule; score: number } | null {
  const q = normalize(query);
  if (!q) return null;
  let best: { rule: BaseRule; score: number } | null = null;
  for (const rule of rules.baseRules) {
    const score = scoreRule(q, rule);
    if (score > 0 && (!best || score > best.score)) {
      best = { rule, score };
    }
  }
  return best;
}

/** Heuristic contamination sniffing for rulebook-fallback mode. */
function looksContaminated(query: string): boolean {
  const q = normalize(query);
  const dirtWords = [
    "greasy", "grease", "dirty", "food", "sauce", "cheese", "oil", "wet",
    "soaked", "stained", "half full", "leftover", "moldy", "crumbs",
    "soiled", "residue", "broken",
  ];
  return dirtWords.some((w) => q.includes(w));
}

export function verdictFromRulebook(query: string, region = "us-generic"): Verdict | null {
  const match = matchRule(query);
  if (!match) return null;
  const variant: "clean" | "contaminated" = looksContaminated(query) ? "contaminated" : "clean";
  return verdictFromRule(match.rule.id, variant, region);
}

/** Deterministic verdict for a known rule id + explicit condition variant (used by SortLab). */
export function verdictFromRule(
  ruleId: string,
  variant: "clean" | "contaminated",
  region = "us-generic"
): Verdict | null {
  const rule = rules.baseRules.find((r) => r.id === ruleId);
  if (!rule) return null;
  const override = rules.regionOverrides.find(
    (o) => o.regionId === region && o.ruleId === rule.id
  );
  const chosen: VariantRule =
    (variant === "clean" ? override?.clean : override?.contaminated) ?? rule[variant];
  return {
    item: rule.item,
    condition: variant === "clean" ? "appears clean" : "shows contamination",
    category: rule.category,
    bin: chosen.bin,
    confidence: 0.55, // rulebook fallback: honest, mid confidence
    reasoning: chosen.reasoning,
    ruleTitle: rule.ruleTitle,
    ruleDetail: rule.ruleDetail,
    source: "rulebook",
    co2eKg: co2eForBin(chosen.bin),
  };
}

export function knownItemNames(): string[] {
  return rules.baseRules.map((r) => r.item);
}
