import { useState } from "react";
import { detectPlugins, ungroupedSkills } from "../utils";

interface Props {
  allSkills: string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export function SkillFilter({ allSkills, selected, onChange }: Props) {
  const [q, setQ] = useState("");
  const plugins = detectPlugins(allSkills);
  const standalone = ungroupedSkills(allSkills, plugins);

  const filtered = q
    ? allSkills.filter((s) => s.toLowerCase().includes(q.toLowerCase()))
    : null;

  function toggle(skill: string) {
    const next = new Set(selected);
    next.has(skill) ? next.delete(skill) : next.add(skill);
    onChange(next);
  }

  function togglePlugin(members: string[]) {
    const allOn = members.every((s) => selected.has(s));
    const next = new Set(selected);
    members.forEach((s) => (allOn ? next.delete(s) : next.add(s)));
    onChange(next);
  }

  function toggleAll() {
    onChange(selected.size === allSkills.length ? new Set() : new Set(allSkills));
  }

  const allOn = selected.size === allSkills.length;
  const someOn = selected.size > 0 && !allOn;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".25rem" }}>
        <span style={{ fontSize: ".7rem", color: "var(--text-subtle)" }}>
          {selected.size} / {allSkills.length}
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
        placeholder="Search skills…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoComplete="off"
      />

      <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: ".1rem", marginTop: ".25rem" }}>
        {filtered !== null ? (
          /* flat search results */
          filtered.length === 0
            ? <span style={{ fontSize: ".75rem", color: "var(--text-subtle)", padding: ".25rem .35rem" }}>No match</span>
            : filtered.map((s) => (
                <label key={s} style={itemStyle}>
                  <input
                    type="checkbox"
                    checked={selected.has(s)}
                    onChange={() => toggle(s)}
                    style={{ marginRight: ".4rem", accentColor: "#3b82f6", flexShrink: 0 }}
                  />
                  <span style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={s}>{s}</span>
                </label>
              ))
        ) : (
          /* grouped view */
          <>
            {[...plugins.entries()].map(([prefix, members]) => {
              const groupAllOn = members.every((s) => selected.has(s));
              const groupSomeOn = members.some((s) => selected.has(s));
              return (
                <div key={prefix}>
                  <label style={groupStyle} onClick={() => togglePlugin(members)}>
                    <input
                      type="checkbox"
                      checked={groupAllOn}
                      ref={(el) => { if (el) el.indeterminate = !groupAllOn && groupSomeOn; }}
                      onChange={() => {}}
                      style={{ marginRight: ".4rem", accentColor: "#3b82f6", flexShrink: 0 }}
                    />
                    <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{prefix}</span>
                    <span style={{ marginLeft: "auto", fontSize: ".68rem", color: "var(--text-subtle)" }}>{members.length}</span>
                  </label>
                  {members.map((s) => (
                    <label key={s} style={{ ...itemStyle, paddingLeft: "1.5rem" }}>
                      <input
                        type="checkbox"
                        checked={selected.has(s)}
                        onChange={() => toggle(s)}
                        style={{ marginRight: ".4rem", accentColor: "#3b82f6", flexShrink: 0 }}
                      />
                      <span style={{ color: "var(--text-muted)" }}>{s.replace(prefix + "-", "")}</span>
                    </label>
                  ))}
                </div>
              );
            })}
            {standalone.map((s) => (
              <label key={s} style={itemStyle}>
                <input
                  type="checkbox"
                  checked={selected.has(s)}
                  onChange={() => toggle(s)}
                  style={{ marginRight: ".4rem", accentColor: "#3b82f6", flexShrink: 0 }}
                />
                <span style={{ color: "var(--text-muted)" }}>{s}</span>
              </label>
            ))}
          </>
        )}
      </div>

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

const groupStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", padding: ".2rem .35rem",
  cursor: "pointer", borderRadius: "var(--r-sm)", fontSize: ".78rem",
  userSelect: "none",
};

const itemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", padding: ".2rem .35rem",
  cursor: "pointer", borderRadius: "var(--r-sm)", fontSize: ".78rem",
  userSelect: "none",
};
