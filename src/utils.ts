import type { HubResult } from "./types";

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function coveragePct(results: { status: string }[]): number {
  const applicable = results.filter((r) => r.status !== "not-applicable");
  if (!applicable.length) return 0;
  return Math.round(
    applicable.filter((r) => r.status === "adopted" || r.status === "divergent").length /
    applicable.length * 100
  );
}

export function detectPlugins(skills: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const skill of skills) {
    const parts = skill.split("-");
    if (parts.length >= 3) {
      const prefix = parts.slice(0, 2).join("-");
      if (!groups.has(prefix)) groups.set(prefix, []);
      groups.get(prefix)!.push(skill);
    }
  }
  for (const [key, members] of groups) {
    if (members.length < 2) groups.delete(key);
  }
  return groups;
}

export function ungroupedSkills(skills: string[], plugins: Map<string, string[]>): string[] {
  const grouped = new Set([...plugins.values()].flat());
  return skills.filter((s) => !grouped.has(s));
}

export function computeAggregateTimeline(
  repos: HubResult[],
  skills: string[],
  cutoff?: string | null,
): { date: string; pct: number }[] {
  const allDates = new Set<string>();
  for (const r of repos) {
    r.history
      .filter((e) => !cutoff || e.evaluatedAt >= cutoff)
      .forEach((e) => allDates.add(e.evaluatedAt));
  }
  const sorted = [...allDates].sort();
  if (sorted.length === 0) return [];

  return sorted.map((date) => {
    let covered = 0, applicable = 0;
    for (const r of repos) {
      const entry = r.history
        .filter((e) => e.evaluatedAt <= date)
        .sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt))[0];
      if (!entry) continue;
      const relevant = entry.results.filter((x) => skills.includes(x.skillName));
      const app = relevant.filter((x) => x.status !== "not-applicable");
      applicable += app.length;
      covered += app.filter((x) => x.status === "adopted" || x.status === "divergent").length;
    }
    return { date, pct: applicable > 0 ? Math.round((covered / applicable) * 100) : 0 };
  });
}
