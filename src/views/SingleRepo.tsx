import { useState } from "react";
import { S_ORDER, SM } from "../constants";
import { AppShell } from "../components/AppShell";
import { Breadcrumb } from "../components/Breadcrumb";
import { CoverageRing } from "../components/DonutChart";
import type { EvaluationReport } from "../types";

interface Props {
  report: EvaluationReport;
  breadcrumb?: { label: string; onClick: () => void };
  repoUrl?: string;
}

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

  const visibleResults = report.results.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!search || r.skillName.toLowerCase().includes(search.toLowerCase())),
  );

  const crumbs = [
    ...(breadcrumb ? [{ label: breadcrumb.label, onClick: breadcrumb.onClick }] : []),
    { label: repoName },
  ];

  return (
    <AppShell>
      <Breadcrumb crumbs={crumbs} />

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

      {/* Compact overview card: chart + counts + progress bar */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r)", padding: ".75rem 1rem",
        marginBottom: "1.25rem", boxShadow: "var(--sh)",
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
                const pct = (counts[s] / scored) * 100;
                return pct > 0
                  ? <div key={s} className="pseg" style={{ width: `${pct.toFixed(2)}%`, background: SM[s].bar }} />
                  : null;
              })}
            </div>
          )}
        </div>
      </div>

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
                    <li key={j} className="ev-item">
                      <span className="ev-file">{m[1]}</span>{m[2] ? ` ${m[2]}` : ""}
                    </li>
                  ) : (
                    <li key={j} className="ev-item">{e}</li>
                  );
                })}
              </ul>
            </details>
          )}
        </div>
      ))}
    </AppShell>
  );
}
