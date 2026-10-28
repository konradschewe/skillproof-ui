import { useRef, useState, useLayoutEffect } from "react";

const PAD = { top: 10, right: 12, bottom: 20, left: 36 };

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
  points: ChartPoint[];
  height?: number;            // CSS px, default 140
  latestDate?: string;        // this dot → onSelect(null)
  selectedDate?: string | null;
  onSelect?: (date: string | null) => void;
}

export function CoverageChart({ points, height = 140, latestDate, selectedDate, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [vw, setVw] = useState(600);

  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    setVw(el.clientWidth || 600);
    const ro = new ResizeObserver(([entry]) => setVw(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (points.length === 0) return null;

  const vh = height;
  const cw = vw - PAD.left - PAD.right;
  const ch = vh - PAD.top - PAD.bottom;

  const timestamps = points.map((p) => new Date(p.date).getTime());
  const minT = timestamps[0], maxT = timestamps[timestamps.length - 1];
  const xOf = (i: number) => PAD.left + ((timestamps[i] - minT) / (maxT - minT || 1)) * cw;
  const yOf = (pct: number) => PAD.top + (1 - pct / 100) * ch;

  const xs = points.map((_, i) => xOf(i));
  const ys = points.map((p) => yOf(p.pct));
  const linePath = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");

  const labelCount = Math.min(5, points.length);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i / Math.max(labelCount - 1, 1)) * (points.length - 1))
  );

  const resolvedSelected = selectedDate === null
    ? (latestDate ?? points[points.length - 1].date)
    : selectedDate;
  const interactive = onSelect !== undefined;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={vh}
      viewBox={`0 0 ${vw} ${vh}`}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Gridlines + Y labels */}
      {[0, 50, 100].map((pct) => {
        const y = yOf(pct);
        return (
          <g key={pct}>
            <line x1={PAD.left} y1={y} x2={vw - PAD.right} y2={y}
              stroke="var(--border)" strokeWidth={1}
              strokeDasharray={pct === 50 ? "4 4" : undefined} />
            <text x={PAD.left - 5} y={y + 4} fontSize={11} fill="var(--text-subtle)" textAnchor="end">
              {pct}%
            </text>
          </g>
        );
      })}

      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--border)" strokeWidth={2} strokeLinejoin="round" />

      {/* Hit areas */}
      {interactive && points.map((p, i) => (
        <rect key={i} x={xs[i] - 10} y={PAD.top} width={20} height={ch}
          fill="transparent" style={{ cursor: "pointer" }}
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
            r={isSelected ? 6 : isLatestDot && interactive ? 4 : 3.5}
            fill={isSelected ? color : "var(--surface)"}
            stroke={isSelected ? color : isLatestDot ? color : "var(--text-subtle)"}
            strokeWidth={isSelected ? 0 : 2}
            style={{ cursor: interactive ? "pointer" : "default", pointerEvents: "none" }}
          >
            <title>{fmtShort(p.date)}: {p.pct}%{isLatestDot ? " (latest)" : ""}</title>
          </circle>
        );
      })}

      {/* X-axis labels */}
      {labelIndices.map((idx) => (
        <text key={idx} x={xs[idx]} y={vh - 3}
          fontSize={11} fill="var(--text-subtle)" textAnchor="middle">
          {fmtShort(points[idx].date)}
        </text>
      ))}
    </svg>
  );
}
