import { useState } from "react";
import { S_ORDER, SM } from "../constants";
import { AppShell } from "../components/AppShell";
import { CoverageRing } from "../components/DonutChart";
import type { EvaluationReport } from "../types";

interface Props {
  report: EvaluationReport;
  breadcrumb?: { label: string; onClick: () => void };
  repoUrl?: string;
}

const STATUS_DEFS: Record<string, string> = {
  adopted:          "Requirements are clearly implemented using the prescribed API",
  divergent:        "All behaviors present, but via a different API or pattern than prescribed",
  partial:          "Some required behaviors are genuinely absent — not just implemented differently",
  missing:          "The skill's requirements are not implemented",
  "not-applicable": "The skill is intentionally irrelevant to this repository",
};

export function SingleRepo({ report, breadcrumb, repoUrl }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const repoName = report.repoPath.split("/").pop() ?? report.repoPath;
  const date = new Date(report.evaluatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const counts = Object.fromEntries(
    S_ORDER.map((s) => [s, report.results.filter((r) => r.status === s).length]),
  ) as Record<string, number>;
  const total = report.results.length;
  const scored = total - (counts["not-applicable"] || 0);
  const pct = scored > 0 ? Math.round(((counts.adopted ?? 0) + (counts.divergent ?? 0)) / scored * 100) : 0;

  const withMetrics = report.results.filter((r) => r.metrics);
  const cached = report.results.length - withMetrics.length;
  const metrics = withMetrics.length > 0 ? {
    tokens: withMetrics.reduce((a, r) => a + r.metrics!.evaluator.inputTokens + r.metrics!.evaluator.outputTokens + r.metrics!.explorer.inputTokens + r.metrics!.explorer.outputTokens, 0),
    cost:   withMetrics.reduce((a, r) => a + r.metrics!.estimatedCostUsd, 0),
    ms:     withMetrics.reduce((a, r) => a + r.metrics!.durationMs, 0),
  } : null;

  const visibleResults = report.results.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!search || r.skillName.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <AppShell>
      {/* Back navigation */}
      {breadcrumb && (
        <button
          onClick={breadcrumb.onClick}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--text-muted)", fontSize: ".78rem", display: "inline-flex", alignItems: "center", gap: ".25rem", marginBottom: ".75rem", fontFamily: "inherit" }}
        >
          ← {breadcrumb.label}
        </button>
      )}

      {/* Title row */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: ".25rem", gap: "1rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{repoName}</h1>
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noreferrer"
            style={{ fontSize: ".78rem", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}>
            ↗ GitHub
          </a>
        )}
      </div>
      <p style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
        {report.repoPath} · {date}
      </p>

      {/* Overview card */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r)", padding: ".75rem 1rem",
        marginBottom: ".35rem", boxShadow: "var(--sh)",
        display: "flex", alignItems: "center", gap: "1.25rem",
      }}>
        <CoverageRing pct={pct} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: scored > 0 ? ".6rem" : 0 }}>
            {(["adopted", "divergent", "partial", "missing"] as const).map((s) => (
              counts[s] > 0 || s === "adopted" || s === "missing" ? (
                <div key={s} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1, color: `var(--${s}-c)` }}>
                    {counts[s]}
                  </div>
                  <div style={{ fontSize: ".62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: ".2rem" }}>
                    {SM[s].label}
                  </div>
                </div>
              ) : null
            ))}
            {counts["not-applicable"] > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1, color: "var(--na-c)" }}>{counts["not-applicable"]}</div>
                <div style={{ fontSize: ".62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: ".2rem" }}>N/A</div>
              </div>
            )}
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: ".62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginTop: ".2rem" }}>Total</div>
            </div>
          </div>
          {scored > 0 && (
            <div className="progress" style={{ marginBottom: 0 }}>
              {(["adopted", "divergent", "partial", "missing"] as const).map((s) => {
                const p = (counts[s] / scored) * 100;
                return p > 0 ? <div key={s} className="pseg" style={{ width: `${p.toFixed(2)}%`, background: SM[s].bar }} /> : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Coverage formula */}
      <p style={{ fontSize: ".65rem", color: "var(--text-subtle)", marginBottom: "1rem", paddingLeft: ".25rem" }}>
        Coverage = (Adopted + Divergent) ÷ non-N/A skills
      </p>

      {/* Run metrics (collapsed) */}
      {metrics && (
        <details style={{ marginBottom: "1rem" }}>
          <summary>
            Run metrics · {withMetrics.length} evaluated{cached > 0 ? ` · ${cached} cached` : ""}
          </summary>
          <div style={{
            display: "flex", gap: "1.25rem", flexWrap: "wrap",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--r)", padding: ".6rem .875rem",
            marginTop: ".4rem", fontSize: ".78rem",
          }}>
            <span style={{ color: "var(--text-muted)" }}>{metrics.tokens.toLocaleString()} tokens</span>
            <span style={{ color: "var(--text-muted)" }}>${metrics.cost.toFixed(4)}</span>
            <span style={{ color: "var(--text-muted)" }}>{(metrics.ms / 1000).toFixed(1)}s</span>
            <span style={{ color: "var(--text-subtle)", borderLeft: "1px solid var(--border)", paddingLeft: "1.25rem" }}>~{Math.round(metrics.tokens / withMetrics.length).toLocaleString()} avg tokens/skill · ${(metrics.cost / withMetrics.length).toFixed(4)} avg cost/skill</span>
          </div>
        </details>
      )}

      {/* Filter row */}
      <div style={{ display: "flex", gap: ".4rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button className={`fbtn${filter === "all" ? " on" : ""}`} onClick={() => setFilter("all")}>
          All ({total})
        </button>
        {S_ORDER.filter((s) => counts[s] > 0).map((s) => (
          <button key={s} className={`fbtn${filter === s ? " on" : ""}`} onClick={() => setFilter(s)}>
            {SM[s].icon} {SM[s].label} ({counts[s]})
          </button>
        ))}
        <div className="search" style={{ marginLeft: "auto" }}>
          <svg className="search-ico" viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={1.8}>
            <circle cx={6.5} cy={6.5} r={4.5} />
            <path d="M10.5 10.5 14 14" />
          </svg>
          <input
            type="text"
            placeholder="Search skills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Skill cards */}
      {visibleResults.length === 0 && (
        <p style={{ color: "var(--text-muted)", padding: "1.5rem 0" }}>No skills match the current filter.</p>
      )}
      {visibleResults.map((r, i) => (
        <div
          key={r.skillName}
          className="card"
          data-s={r.status}
          style={{ animationDelay: `${(i * 0.025).toFixed(3)}s` }}
        >
          <div className="card-hdr">
            <span className="card-ico">{SM[r.status as keyof typeof SM]?.icon}</span>
            <span className="card-name">{r.skillName}</span>
            <span className="badge" data-s={r.status}>{SM[r.status as keyof typeof SM]?.label ?? r.status}</span>
          </div>
          <div className="reasoning"><p>{r.reasoning}</p></div>
          {r.evidence.length > 0 && (
            <details>
              <summary>{r.evidence.length} evidence item{r.evidence.length !== 1 ? "s" : ""}</summary>
              <ul className="ev-list">
                {r.evidence.map((e, j) => {
                  const m = e.match(/^([\w./\-]+\.[a-zA-Z]+(?:\s+lines?\s+[\d\-,]+)?):?\s*(.*)/);
                  return m ? (
                    <li key={j} className="ev-item"><span className="ev-file">{m[1]}</span>{m[2] ? ` ${m[2]}` : ""}</li>
                  ) : (
                    <li key={j} className="ev-item">{e}</li>
                  );
                })}
              </ul>
            </details>
          )}
        </div>
      ))}

      {/* Status guide (reference, at bottom) */}
      <details style={{ marginTop: "1.5rem" }}>
        <summary>Status guide</summary>
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r)", padding: ".75rem 1rem",
          marginTop: ".4rem", display: "flex", flexDirection: "column", gap: ".5rem",
        }}>
          {S_ORDER.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "flex-start", gap: ".75rem", fontSize: ".78rem" }}>
              <span className="badge" data-s={s} style={{ flexShrink: 0, whiteSpace: "nowrap" }}>{SM[s].icon} {SM[s].label}</span>
              <span style={{ color: "var(--text-muted)", paddingTop: ".1rem" }}>{STATUS_DEFS[s]}</span>
            </div>
          ))}
        </div>
      </details>
    </AppShell>
  );
}
