import { useState } from "react";
import { SM } from "../constants";
import { AppShell } from "../components/AppShell";
import { RepoFilter } from "../components/RepoFilter";
import { SkillFilter } from "../components/SkillFilter";
import { CoverageRing } from "../components/DonutChart";
import { Sparkline } from "../components/Sparkline";
import type { HubResult } from "../types";
import { relativeTime } from "../utils";

function allSkills(results: HubResult[]): string[] {
  const skills = new Set<string>();
  for (const r of results) r.report.results.forEach((s) => skills.add(s.skillName));
  return [...skills].sort();
}

function repoCoverage(result: HubResult, skills: string[]) {
  const evaluated = result.report.results.filter((r) => skills.includes(r.skillName));
  const applicable = evaluated.filter((r) => r.status !== "not-applicable");
  const covered = applicable.filter((r) => r.status === "adopted" || r.status === "divergent").length;
  const counts = {
    adopted:   applicable.filter((r) => r.status === "adopted").length,
    divergent: applicable.filter((r) => r.status === "divergent").length,
    partial:   applicable.filter((r) => r.status === "partial").length,
    missing:   applicable.filter((r) => r.status === "missing").length,
  };
  return { covered, total: applicable.length, counts };
}

function CoverageBar({ covered, total }: { covered: number; total: number }) {
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
  const color = pct === 100 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const textColor = pct === 100 ? "var(--adopted-c)" : pct >= 50 ? "var(--partial-c)" : "var(--missing-c)";
  return (
    <div className="cov-bar">
      <div className="cov-track">
        <div className="cov-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="cov-pct" style={{ color: textColor }}>{pct}%</span>
      <span className="cov-frac">({covered}/{total})</span>
    </div>
  );
}

export function MultiRepo({ results, onSelectRepo }: { results: HubResult[]; onSelectRepo: (r: HubResult) => void }) {
  const allRepos = [...new Set(results.map((r) => r.repo))].sort();
  const skills = allSkills(results);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set(allRepos));
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set(skills));
  const [filterOpen, setFilterOpen] = useState(false);

  const visibleSkills = skills.filter((s) => selectedSkills.has(s));
  const visibleRepos = results
    .filter((r) => selectedRepos.has(r.repo))
    .filter((r) => visibleSkills.some((s) => r.report.results.find((x) => x.skillName === s)))
    .sort((a, b) => a.repo.localeCompare(b.repo));

  const totalApplicable = visibleRepos.reduce((sum, r) => sum + repoCoverage(r, visibleSkills).total, 0);
  const totalCovered   = visibleRepos.reduce((sum, r) => sum + repoCoverage(r, visibleSkills).covered, 0);
  const avgPct = totalApplicable > 0 ? Math.round((totalCovered / totalApplicable) * 100) : 0;

  const repoBadge = selectedRepos.size < allRepos.length ? allRepos.length - selectedRepos.size : 0;
  const skillBadge = selectedSkills.size < skills.length ? skills.length - selectedSkills.size : 0;
  const filterBadge = repoBadge + skillBadge;

  const totalAdopted   = visibleRepos.reduce((s, r) => s + repoCoverage(r, visibleSkills).counts.adopted, 0);
  const totalDivergent = visibleRepos.reduce((s, r) => s + repoCoverage(r, visibleSkills).counts.divergent, 0);
  const totalPartial   = visibleRepos.reduce((s, r) => s + repoCoverage(r, visibleSkills).counts.partial, 0);
  const totalMissing   = visibleRepos.reduce((s, r) => s + repoCoverage(r, visibleSkills).counts.missing, 0);

  return (
    <AppShell>
      {/* Title + filter toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".75rem", flexWrap: "wrap", gap: ".5rem" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Hub</h1>
        <button
          className={`fbtn${filterOpen ? " on" : ""}`}
          onClick={() => setFilterOpen((v) => !v)}
          style={{ display: "flex", alignItems: "center", gap: ".4rem" }}
        >
          Filters
          {filterBadge > 0 && <span className="skill-badge">{filterBadge}</span>}
          <span style={{ fontSize: ".6rem", opacity: .6 }}>{filterOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Inline filter panel — two columns, expands inline */}
      {filterOpen && (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r)", padding: "1rem",
          marginBottom: "1rem", boxShadow: "var(--sh)",
        }}>
          <div>
            <div style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: ".5rem" }}>
              Repositories
            </div>
            <RepoFilter allRepos={allRepos} selected={selectedRepos} onChange={setSelectedRepos} />
          </div>
          <div>
            <div style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: ".5rem" }}>
              Skills
            </div>
            <SkillFilter allSkills={skills} selected={selectedSkills} onChange={setSelectedSkills} />
          </div>
        </div>
      )}

      {/* Summary bar: counts + coverage ring */}
      <div style={{
        display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap",
        padding: ".6rem .875rem",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r)", fontSize: ".8rem", marginBottom: "1.25rem",
        boxShadow: "var(--sh)",
      }}>
        <span style={{ color: "var(--text-muted)" }}>
          {visibleRepos.length} {visibleRepos.length === 1 ? "repo" : "repos"} · {visibleSkills.length} skills
        </span>
        <span style={{ width: 1, height: "1em", background: "var(--border)", flexShrink: 0 }} />
        {totalAdopted > 0   && <span style={{ color: "var(--adopted-c)" }}>{SM.adopted.icon} {totalAdopted}</span>}
        {totalDivergent > 0 && <span style={{ color: "var(--divergent-c)" }}>{SM.divergent.icon} {totalDivergent}</span>}
        {totalPartial > 0   && <span style={{ color: "var(--partial-c)" }}>{SM.partial.icon} {totalPartial}</span>}
        {totalMissing > 0   && <span style={{ color: "var(--missing-c)", fontWeight: 600 }}>{SM.missing.icon} {totalMissing}</span>}
        <span style={{ marginLeft: "auto", flexShrink: 0 }}>
          <CoverageRing pct={avgPct} />
        </span>
      </div>

      {/* Table */}
      {visibleRepos.length === 0 ? (
        <p style={{ color: "var(--text-muted)", padding: "1.5rem 0" }}>
          {results.length === 0
            ? "No results yet. Configure hub-repo in your skillproof-action workflow."
            : "No repositories match the current filters."}
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>Coverage</th>
                <th>Trend</th>
                <th className="center">{SM.adopted.icon}</th>
                <th className="center">{SM.divergent.icon}</th>
                <th className="center">{SM.partial.icon}</th>
                <th className="center">{SM.missing.icon}</th>
                <th style={{ color: "var(--text-subtle)", fontWeight: 400 }}>Last analyzed</th>
              </tr>
            </thead>
            <tbody>
              {visibleRepos.map((r) => {
                const { covered, total, counts } = repoCoverage(r, visibleSkills);
                return (
                  <tr key={r.repo}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <button className="repo-btn" onClick={() => onSelectRepo(r)}>
                          {r.repo.split("/")[1] ?? r.repo}
                        </button>
                        <a href={r.repoUrl} target="_blank" rel="noreferrer"
                          style={{ color: "var(--text-subtle)", fontSize: ".75rem", textDecoration: "none" }}
                          title="Open on GitHub">↗</a>
                      </div>
                    </td>
                    <td><CoverageBar covered={covered} total={total} /></td>
                    <td>
                      {r.history && r.history.length >= 2
                        ? <Sparkline history={r.history} />
                        : <span style={{ color: "var(--text-subtle)", fontSize: ".72rem" }}>—</span>}
                    </td>
                    <td className="center">
                      {counts.adopted > 0
                        ? <span style={{ color: "var(--adopted-c)", fontWeight: 600 }}>{counts.adopted}</span>
                        : <span className="count-zero">—</span>}
                    </td>
                    <td className="center">
                      {counts.divergent > 0
                        ? <span style={{ color: "var(--divergent-c)", fontWeight: 600 }}>{counts.divergent}</span>
                        : <span className="count-zero">—</span>}
                    </td>
                    <td className="center">
                      {counts.partial > 0
                        ? <span style={{ color: "var(--partial-c)", fontWeight: 600 }}>{counts.partial}</span>
                        : <span className="count-zero">—</span>}
                    </td>
                    <td className="center">
                      {counts.missing > 0
                        ? <span style={{ color: "var(--missing-c)", fontWeight: 700 }}>{counts.missing}</span>
                        : <span className="count-zero">—</span>}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>
                      {relativeTime(r.report.evaluatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
