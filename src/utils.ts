export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
