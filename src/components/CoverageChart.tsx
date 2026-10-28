const VW = 600;
const PAD = { top: 8, right: 8, bottom: 16, left: 26 };

function xScale(t: number, minT: number, maxT: number) {
  const cw = VW - PAD.left - PAD.right;
  return PAD.left + ((t - minT) / (maxT - minT || 1)) * cw;
}
function yScale(pct: number, vh: number) {
  const ch = vh - PAD.top - PAD.bottom;
  return PAD.top + (1 - pct / 100) * ch;
}
function dotColor(pct: number) {
  return pct >= 80 ? "var(--adopted-c)" : pct >= 50 ? "var(--partial-c)" : "var(--missing-c)";
}
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export interface ChartPoint {
  date: string;
  pct: number;
}

interface Props {
  points: ChartPoint[];           // sorted oldest → newest
  height?: number;                // CSS px height, default 80
  latestDate?: string;            // this dot → onSelect(null)
  selectedDate?: string | null;   // undefined = no interactive selection
  onSelect?: (date: string | null) => void;
}

export function CoverageChart({ points, height = 80, latestDate, selectedDate, onSelect }: Props) {
  if (points.length === 0) return null;

  const vh = height;
  const timestamps = points.map((p) => new Date(p.date).getTime());
  const minT = timestamps[0], maxT = timestamps[timestamps.length - 1];

  const xs = points.map((_, i) => xScale(timestamps[i], minT, maxT));
  const ys = points.map((p) => yScale(p.pct, vh));
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");

  const labelCount = Math.min(5, points.length);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i / Math.max(labelCount - 1, 1)) * (points.length - 1))
  );

  const resolvedSelected = selectedDate === null ? (latestDate ?? points[points.length - 1].date) : selectedDate;
  const interactive = onSelect !== undefined;

  return (
    <svg
      viewBox={`0 0 ${VW} ${vh}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: `${height}px` }}
    >
      {/* Gridlines + Y labels */}
      {[0, 50, 100].map((pct) => {
        const y = yScale(pct, vh);
        return (
          <g key={pct}>
            <line x1={PAD.left} y1={y} x2={VW - PAD.right} y2={y}
              stroke="var(--border)" strokeWidth={0.8}
              strokeDasharray={pct === 50 ? "3 3" : undefined} />
            <text x={PAD.left - 4} y={y + 3.5} fontSize={7} fill="var(--text-subtle)" textAnchor="end">
              {pct}%
            </text>
          </g>
        );
      })}

      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--border)" strokeWidth={1.8} strokeLinejoin="round" />

      {/* Hit areas (only when interactive) */}
      {interactive && points.map((p, i) => (
        <rect
          key={i}
          x={xs[i] - 9} y={PAD.top}
          width={18} height={vh - PAD.top - PAD.bottom}
          fill="transparent"
          style={{ cursor: "pointer" }}
          onClick={() => onSelect!(p.date === latestDate ? null : p.date)}
        />
      ))}

      {/* Dots */}
      {points.map((p, i) => {
        const isSelected = interactive && p.date === resolvedSelected;
        const isLatestDot = p.date === latestDate;
        const color = dotColor(p.pct);
        return (
          <circle key={i} cx={xs[i]} cy={ys[i]}
            r={isSelected ? 5.5 : isLatestDot && interactive ? 3.5 : 3}
            fill={isSelected ? color : "var(--surface)"}
            stroke={isSelected ? color : isLatestDot ? color : "var(--text-subtle)"}
            strokeWidth={isSelected ? 0 : 1.8}
            style={{ cursor: interactive ? "pointer" : "default", pointerEvents: "none" }}
          >
            <title>{fmtShort(p.date)}: {p.pct}%{isLatestDot ? " (latest)" : ""}</title>
          </circle>
        );
      })}

      {/* X-axis labels */}
      {labelIndices.map((idx) => (
        <text key={idx} x={xs[idx]} y={vh - 2}
          fontSize={7} fill="var(--text-subtle)" textAnchor="middle">
          {fmtShort(points[idx].date)}
        </text>
      ))}
    </svg>
  );
}
