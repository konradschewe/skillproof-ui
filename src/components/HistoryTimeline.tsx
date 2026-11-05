import type { HistoryEntry, AdoptionStatus } from "../types";

const STATUS_COLOR: Record<string, string> = {
  adopted:          "var(--adopted-c)",
  divergent:        "var(--divergent-c)",
  partial:          "var(--partial-c)",
  missing:          "var(--missing-c)",
  "not-applicable": "var(--na-c)",
};
const STATUS_BG: Record<string, string> = {
  adopted:          "var(--adopted-bg)",
  divergent:        "var(--divergent-bg)",
  partial:          "var(--partial-bg)",
  missing:          "var(--missing-bg)",
  "not-applicable": "var(--na-bg)",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Cell({ status, date }: { status: AdoptionStatus | undefined; date: string }) {
  if (!status) {
    return <td style={{ padding: "2px 3px" }}><span style={{ display: "block", width: 13, height: 13, borderRadius: 3, background: "var(--border)", margin: "auto" }} /></td>;
  }
  return (
    <td style={{ padding: "2px 3px" }} title={`${fmtDate(date)}: ${status}`}>
      <span style={{
        display: "block", width: 13, height: 13, borderRadius: 3,
        background: STATUS_BG[status] ?? "var(--border)",
        border: `1.5px solid ${STATUS_COLOR[status] ?? "transparent"}`,
        margin: "auto",
      }} />
    </td>
  );
}

export function HistoryTimeline({ history, skills }: { history: HistoryEntry[]; skills: string[] }) {
  const entries = [...history]
    .sort((a, b) => a.evaluatedAt.localeCompare(b.evaluatedAt))
    .slice(-12);

  return (
    <div style={{ overflowX: "auto", marginTop: ".5rem" }}>
      <table style={{ borderCollapse: "collapse", fontSize: ".72rem", whiteSpace: "nowrap" }}>
        <thead>
          <tr>
            <th style={{ padding: ".2rem 1rem .2rem 0", textAlign: "left", color: "var(--text-muted)", fontWeight: 400 }}>Skill</th>
            {entries.map((e, i) => (
              <th key={i} style={{ padding: "2px 3px", textAlign: "center", color: "var(--text-subtle)", fontWeight: 400, minWidth: "2.2rem" }}>
                {fmtDate(e.evaluatedAt)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill}>
              <td style={{ padding: ".2rem 1rem .2rem 0", color: "var(--text-2)", fontWeight: 500 }}>{skill}</td>
              {entries.map((e, i) => {
                const r = e.results.find((x) => x.skillName === skill);
                return <Cell key={i} status={r?.status as AdoptionStatus | undefined} date={e.evaluatedAt} />;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
