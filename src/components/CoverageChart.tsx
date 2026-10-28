import type { HistoryEntry } from "../types";
import { coveragePct } from "../utils";

const VW = 600, VH = 44;
const PAD = { top: 5, right: 6, bottom: 11, left: 18 };
const CW = VW - PAD.left - PAD.right;
const CH = VH - PAD.top - PAD.bottom;

function xScale(t: number, minT: number, maxT: number) {
  return PAD.left + ((t - minT) / (maxT - minT || 1)) * CW;
}
function yScale(pct: number) {
  return PAD.top + (1 - pct / 100) * CH;
}
function dotColor(pct: number) {
  return pct >= 80 ? "var(--adopted-c)" : pct >= 50 ? "var(--partial-c)" : "var(--missing-c)";
}
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  history: HistoryEntry[]; // sorted oldest → newest; last entry = latest
  selectedIso: string | null; // null = latest
  onSelect: (iso: string | null) => void;
}

export function CoverageChart({ history, selectedIso, onSelect }: Props) {
  if (history.length === 0) return null;

  const sorted = [...history].sort((a, b) => a.evaluatedAt.localeCompare(b.evaluatedAt));
  const latestIso = sorted[sorted.length - 1].evaluatedAt;

  const points = sorted.map((e) => ({
    iso: e.evaluatedAt,
    pct: coveragePct(e.results),
    isLatest: e.evaluatedAt === latestIso,
  }));

  const timestamps = points.map((p) => new Date(p.iso).getTime());
  const minT = timestamps[0], maxT = timestamps[timestamps.length - 1];

  const xs = points.map((p) => xScale(new Date(p.iso).getTime(), minT, maxT));
  const ys = points.map((p) => yScale(p.pct));
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");

  const labelCount = Math.min(4, points.length);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i / Math.max(labelCount - 1, 1)) * (points.length - 1))
  );

  const resolvedSelected = selectedIso ?? latestIso;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: "44px" }}
    >
      {/* Gridlines + Y labels */}
      {[0, 50, 100].map((pct) => {
        const y = yScale(pct);
        return (
          <g key={pct}>
            <line x1={PAD.left} y1={y} x2={VW - PAD.right} y2={y}
              stroke="var(--border)" strokeWidth={0.75}
              strokeDasharray={pct === 50 ? "3 3" : undefined} />
            <text x={PAD.left - 3} y={y + 3} fontSize={5.5} fill="var(--text-subtle)" textAnchor="end">
              {pct}%
            </text>
          </g>
        );
      })}

      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--border)" strokeWidth={1.5} strokeLinejoin="round" />

      {/* Hit areas */}
      {points.map((p, i) => (
        <rect
          key={i}
          x={xs[i] - 8} y={PAD.top}
          width={16} height={CH}
          fill="transparent"
          style={{ cursor: "pointer" }}
          onClick={() => onSelect(p.isLatest ? null : p.iso)}
        />
      ))}

      {/* Dots */}
      {points.map((p, i) => {
        const isSelected = p.iso === resolvedSelected;
        const color = dotColor(p.pct);
        return (
          <circle key={i} cx={xs[i]} cy={ys[i]}
            r={isSelected ? 4.5 : 2.5}
            fill={isSelected ? color : "var(--surface)"}
            stroke={isSelected ? color : "var(--text-subtle)"}
            strokeWidth={isSelected ? 0 : 1.5}
            style={{ cursor: "pointer", pointerEvents: "none" }}
          >
            <title>{fmtShort(p.iso)}: {p.pct}%{p.isLatest ? " (latest)" : ""}</title>
          </circle>
        );
      })}

      {/* X-axis labels */}
      {labelIndices.map((idx) => (
        <text key={idx} x={xs[idx]} y={VH - 1.5}
          fontSize={5.5} fill="var(--text-subtle)" textAnchor="middle">
          {fmtShort(points[idx].iso)}
        </text>
      ))}
    </svg>
  );
}
