import { S_ORDER, SM, sm } from "../constants";
import type { SkillEvaluationResult } from "../types";

interface DonutProps {
  results: SkillEvaluationResult[];
  size?: number;
  showLegend?: boolean;
  showLabel?: boolean;
}

export function DonutChart({ results, size = 96, showLegend = true, showLabel = true }: DonutProps) {
  const total = results.length;
  const counts = Object.fromEntries(S_ORDER.map((s) => [s, results.filter((r) => r.status === s).length]));
  const scored = total - (counts["not-applicable"] || 0);
  const pct = scored > 0 ? Math.round(((counts.adopted || 0) + (counts.divergent || 0)) / scored * 100) : 0;

  const R = 36, cx = 50, cy = 50, circ = 2 * Math.PI * R;
  let cum = 0;

  const segs = S_ORDER.flatMap((s) => {
    const n = counts[s] || 0;
    if (n === 0) return [];
    const frac = n / total;
    const len = frac * circ;
    const el = (
      <circle
        key={s}
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={SM[s].bar}
        strokeWidth={9}
        strokeDasharray={`${len.toFixed(2)} ${(circ - len).toFixed(2)}`}
        strokeDashoffset={`${(-(cum * circ)).toFixed(2)}`}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    cum += frac;
    return [el];
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".5rem" }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx={cx} cy={cy} r={R} fill="none" style={{ stroke: "var(--border)" }} strokeWidth={9} />
        {segs}
        {showLabel && <>
          <text x={cx} y={cy - 4} textAnchor="middle" style={{ fill: "var(--text)" }}
            fontSize={size < 90 ? 22 : 20} fontWeight={800}>
            {pct}%
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" style={{ fill: "var(--text-muted)" }} fontSize={9}>
            coverage
          </text>
        </>}
      </svg>
      {showLegend && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".2rem .6rem", justifyContent: "center", maxWidth: 180 }}>
          {S_ORDER.filter((s) => counts[s] > 0).map((s) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: ".3rem", fontSize: ".68rem", color: "var(--text-muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: SM[s].bar, flexShrink: 0 }} />
              {SM[s].label} {counts[s]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface AggregateProps {
  pct: number;
  size?: number;
  showLabel?: boolean;
}

export function AggregateCoverage({ pct, size = 96, showLabel = true }: AggregateProps) {
  const R = 36, cx = 50, cy = 50, circ = 2 * Math.PI * R;
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const len = (pct / 100) * circ;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx={cx} cy={cy} r={R} fill="none" style={{ stroke: "var(--border)" }} strokeWidth={9} />
      <circle
        cx={cx} cy={cy} r={R}
        fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={`${len.toFixed(2)} ${(circ - len).toFixed(2)}`}
        strokeDashoffset="0"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {showLabel && <>
        <text x={cx} y={cy - 4} textAnchor="middle" style={{ fill: "var(--text)" }}
          fontSize={size < 90 ? 22 : 20} fontWeight={800}>
          {pct}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fill: "var(--text-muted)" }} fontSize={9}>
          coverage
        </text>
      </>}
    </svg>
  );
}

export function CoverageRing({ pct }: { pct: number }) {
  const R = 36, cx = 50, cy = 50, circ = 2 * Math.PI * R;
  const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const textColor = pct >= 80 ? "var(--adopted-c)" : pct >= 50 ? "var(--partial-c)" : "var(--missing-c)";
  const len = (pct / 100) * circ;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={48} height={48}>
        <circle cx={cx} cy={cy} r={R} fill="none" style={{ stroke: "var(--border)" }} strokeWidth={10} />
        <circle
          cx={cx} cy={cy} r={R}
          fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${len.toFixed(2)} ${(circ - len).toFixed(2)}`}
          strokeDashoffset="0"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div>
        <div style={{ fontSize: ".95rem", fontWeight: 700, lineHeight: 1, color: textColor }}>{pct}%</div>
        <div style={{ fontSize: ".65rem", color: "var(--text-muted)", marginTop: ".2rem" }}>Coverage</div>
      </div>
    </div>
  );
}

export { sm };
