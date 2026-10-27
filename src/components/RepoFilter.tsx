import { useState } from "react";

interface Props {
  allRepos: string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export function RepoFilter({ allRepos, selected, onChange }: Props) {
  const [q, setQ] = useState("");

  const filtered = q
    ? allRepos.filter((r) => r.toLowerCase().includes(q.toLowerCase()))
    : allRepos;

  function toggle(repo: string) {
    const next = new Set(selected);
    next.has(repo) ? next.delete(repo) : next.add(repo);
    onChange(next);
  }

  function toggleAll() {
    onChange(selected.size === allRepos.length ? new Set() : new Set(allRepos));
  }

  const allOn = selected.size === allRepos.length;
  const someOn = selected.size > 0 && !allOn;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".25rem" }}>
        <span style={{ fontSize: ".7rem", color: "var(--text-subtle)" }}>
          {selected.size} / {allRepos.length}
        </span>
        <button
          onClick={toggleAll}
          style={{ fontSize: ".68rem", color: "var(--text-subtle)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          {allOn ? "Clear all" : "Select all"}
        </button>
      </div>

      <input
        type="text"
        className="sidebar-search"
        placeholder="Search repos…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoComplete="off"
      />

      <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: ".1rem", marginTop: ".25rem" }}>
        {filtered.length === 0 && (
          <span style={{ fontSize: ".75rem", color: "var(--text-subtle)", padding: ".25rem .35rem" }}>No match</span>
        )}
        {filtered.map((repo) => {
          const shortName = repo.split("/")[1] ?? repo;
          return (
            <label key={repo} style={itemStyle}>
              <input
                type="checkbox"
                checked={selected.has(repo)}
                onChange={() => toggle(repo)}
                style={{ marginRight: ".4rem", accentColor: "#3b82f6", flexShrink: 0 }}
              />
              <span style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                title={repo}>
                {shortName}
              </span>
            </label>
          );
        })}
      </div>

      {/* master checkbox hidden in header row above */}
      <input
        type="checkbox"
        checked={allOn}
        ref={(el) => { if (el) el.indeterminate = someOn; }}
        onChange={toggleAll}
        style={{ display: "none" }}
      />
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", padding: ".2rem .35rem",
  cursor: "pointer", borderRadius: "var(--r-sm)", fontSize: ".78rem",
  userSelect: "none",
};
