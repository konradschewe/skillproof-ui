import type { HistoryEntry } from "../types";
import { coveragePctFromHistory } from "../utils";

export function Sparkline({ history }: { history: HistoryEntry[] }) {
  const sorted = [...history].sort((a, b) => a.evaluatedAt.localeCompare(b.evaluatedAt));
  const pts = sorted.slice(-10).map((e) => coveragePctFromHistory(e.skills));
  if (pts.length < 2) return null;

  const W = 64, H = 20, PAD = 2;
  const xs = pts.map((_, i) => PAD + (i / (pts.length - 1)) * (W - PAD * 2));
  const ys = pts.map((p) => PAD + (1 - p / 100) * (H - PAD * 2));
  const points = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");

  const last = pts[pts.length - 1];
  const dotColor = last >= 80 ? "var(--adopted-c)" : last >= 50 ? "var(--partial-c)" : "var(--missing-c)";
  const trend = last - pts[0];
  const lineColor = trend > 5 ? "var(--adopted-c)" : trend < -5 ? "var(--missing-c)" : "var(--text-subtle)";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={lineColor} strokeWidth={1.5} strokeOpacity={0.5} strokeLinejoin="round" />
      {pts.map((_, i) => (
        <circle
          key={i}
          cx={xs[i]}
          cy={ys[i]}
          r={i === pts.length - 1 ? 3 : 2}
          fill={i === pts.length - 1 ? dotColor : "var(--text-subtle)"}
          fillOpacity={i === pts.length - 1 ? 1 : 0.4}
        />
      ))}
    </svg>
  );
}
