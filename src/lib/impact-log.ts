import type { Bin } from "@/lib/types";

export interface ImpactEntry {
  ts: number;
  item: string;
  bin: Bin;
  co2eKg: number;
}

const KEY = "sortcall-impact-log-v1";

export function getLog(): ImpactEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ImpactEntry[]) : [];
  } catch {
    return [];
  }
}

export function addEntry(entry: ImpactEntry): ImpactEntry[] {
  const log = [entry, ...getLog()].slice(0, 500);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    /* storage full or blocked */
  }
  return log;
}

/** Fill the log with demo entries (only when empty) — used by /impact?seed=1 for screenshots and demos. */
export function seedDemo(): ImpactEntry[] {
  const now = Date.now();
  const day = 86_400_000;
  const entries: ImpactEntry[] = [
    { ts: now - 0.2 * day, item: "pizza box", bin: "compost", co2eKg: 0.25 },
    { ts: now - 0.5 * day, item: "water bottle", bin: "recycle", co2eKg: 0.18 },
    { ts: now - 1.2 * day, item: "old phone", bin: "ewaste", co2eKg: 0.6 },
    { ts: now - 1.8 * day, item: "banana peel", bin: "compost", co2eKg: 0.25 },
    { ts: now - 2.4 * day, item: "greasy takeout box", bin: "landfill", co2eKg: 0 },
    { ts: now - 3.1 * day, item: "glass jar", bin: "recycle", co2eKg: 0.18 },
    { ts: now - 4.2 * day, item: "plastic bags", bin: "special", co2eKg: 0.2 },
  ];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    /* noop */
  }
  return entries;
}

export function clearLog(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export interface ImpactStats {
  total: number;
  co2eKg: number;
  diverted: number; // recycle + compost + ewaste + special counts
  landfill: number;
  byBin: Record<Bin, number>;
  streakDays: number;
  last7Days: { day: string; count: number }[];
}

export function computeStats(log: ImpactEntry[]): ImpactStats {
  const byBin: Record<Bin, number> = {
    recycle: 0, compost: 0, landfill: 0, ewaste: 0, hazardous: 0, special: 0,
  };
  let co2eKg = 0;
  for (const e of log) {
    byBin[e.bin] = (byBin[e.bin] ?? 0) + 1;
    co2eKg += e.co2eKg;
  }

  const diverted = byBin.recycle + byBin.compost + byBin.ewaste + byBin.special;

  // streak: consecutive days (ending today or yesterday) with at least one sort
  const daySet = new Set(log.map((e) => new Date(e.ts).toDateString()));
  let streakDays = 0;
  const cursor = new Date();
  if (!daySet.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (daySet.has(cursor.toDateString())) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const last7Days: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    last7Days.push({
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: log.filter((e) => new Date(e.ts).toDateString() === ds).length,
    });
  }

  return { total: log.length, co2eKg, diverted, landfill: byBin.landfill, byBin, streakDays, last7Days };
}
