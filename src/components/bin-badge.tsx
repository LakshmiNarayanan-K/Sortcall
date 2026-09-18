import type { Bin } from "@/lib/types";

export const BIN_META: Record<Bin, { label: string; icon: string; color: string; sub: string }> = {
  recycle: { label: "Recycle", icon: "♻️", color: "#34d399", sub: "curbside bin" },
  compost: { label: "Compost", icon: "🌱", color: "#a3e635", sub: "organics bin" },
  landfill: { label: "Landfill", icon: "🗑️", color: "#f87171", sub: "trash bin" },
  ewaste: { label: "E-Waste", icon: "🔌", color: "#60a5fa", sub: "drop-off point" },
  hazardous: { label: "Hazardous", icon: "⚠️", color: "#fbbf24", sub: "hazmat drop-off" },
  special: { label: "Special", icon: "📍", color: "#c084fc", sub: "store drop-off" },
};

export function BinBadge({ bin, size = "md" }: { bin: Bin; size?: "sm" | "md" | "lg" }) {
  const meta = BIN_META[bin];
  const pad = size === "lg" ? "px-4 py-2 text-lg" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${pad}`}
      style={{ background: `${meta.color}1f`, color: meta.color, border: `1px solid ${meta.color}55` }}
    >
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
      <span className="font-normal opacity-70">· {meta.sub}</span>
    </span>
  );
}
