"use client";

import type { ImpactStats } from "@/lib/impact-log";

export function downloadImpactCard(stats: ImpactStats) {
  const W = 1000;
  const H = 620;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#071410");
  bg.addColorStop(1, "#0d211b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // glow accents
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, 380);
  glow.addColorStop(0, "rgba(52,211,153,0.22)");
  glow.addColorStop(1, "rgba(52,211,153,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // border
  ctx.strokeStyle = "rgba(52,211,153,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.textBaseline = "top";

  // brand
  ctx.fillStyle = "#34d399";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText("SortCall", 64, 56);
  ctx.fillStyle = "#8fb8a8";
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText("Make the right call at the bin.", 64, 112);

  // headline number
  ctx.fillStyle = "#e7f6ee";
  ctx.font = "bold 96px system-ui, sans-serif";
  ctx.fillText(`${stats.total}`, 64, 180);
  ctx.fillStyle = "#8fb8a8";
  ctx.font = "28px system-ui, sans-serif";
  ctx.fillText("items sorted responsibly", 64 + ctx.measureText(`${stats.total}`).width + 24, 226);

  // stat grid
  const cells: [string, string][] = [
    [`${stats.co2eKg.toFixed(1)} kg`, "CO₂e avoided"],
    [`${stats.diverted}`, "diverted from landfill"],
    [`${stats.streakDays} day${stats.streakDays === 1 ? "" : "s"}`, "sorting streak"],
  ];
  cells.forEach(([big, small], i) => {
    const x = 64 + i * 300;
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 56px system-ui, sans-serif";
    ctx.fillText(big, x, 320);
    ctx.fillStyle = "#8fb8a8";
    ctx.font = "24px system-ui, sans-serif";
    ctx.fillText(small, x, 392);
  });

  // footer
  ctx.fillStyle = "#5f8a7b";
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillText("Sorted with SortCall · Earth Forward · NextStep Hacks 2026", 64, 520);

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "sortcall-impact.png";
  a.click();
}
