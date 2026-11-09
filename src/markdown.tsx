import { Fragment, type ReactNode } from "react";

function parseInline(text: string): ReactNode {
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  const parts: ReactNode[] = [];
  let last = 0, k = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined) parts.push(<strong key={k++}>{parseInline(m[2])}</strong>);
    else                    parts.push(<code key={k++}>{m[3]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return <Fragment>{parts}</Fragment>;
}

export function renderMarkdown(text: string): ReactNode {
  const blocks = text.split(/\n\n+/);

  type RunType = "p" | "ol" | "ul";
  type Run = { type: RunType; items: string[] };

  // Collect per-block runs (preserves multi-line paragraph merging within blocks)
  const allBlockRuns: Run[][] = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (!lines.length) continue;
    const runs: Run[] = [];
    for (const line of lines) {
      const olMatch = /^\d+\.\s+(.+)/.exec(line);
      const ulMatch = /^[-*]\s+(.+)/.exec(line);
      const type: RunType = olMatch ? "ol" : ulMatch ? "ul" : "p";
      const content = olMatch?.[1] ?? ulMatch?.[1] ?? line;
      const last = runs[runs.length - 1];
      if (last?.type === type) last.items.push(content);
      else runs.push({ type, items: [content] });
    }
    allBlockRuns.push(runs);
  }

  // Flatten, merging consecutive list runs across block boundaries so that
  // blank lines between list items don't split them into separate <ol>/<ul> elements
  const flatRuns: Run[] = [];
  for (const runs of allBlockRuns) {
    for (const run of runs) {
      const last = flatRuns[flatRuns.length - 1];
      if (last && last.type === run.type && run.type !== "p") {
        last.items.push(...run.items);
      } else {
        flatRuns.push({ type: run.type, items: [...run.items] });
      }
    }
  }

  const nodes: ReactNode[] = [];
  for (let ri = 0; ri < flatRuns.length; ri++) {
    const { type, items } = flatRuns[ri];
    if (type === "ol") {
      nodes.push(
        <ol key={ri}>
          {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
        </ol>
      );
    } else if (type === "ul") {
      nodes.push(
        <ul key={ri}>
          {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
        </ul>
      );
    } else {
      nodes.push(<p key={ri}>{parseInline(items.join(" "))}</p>);
    }
  }

  return <>{nodes}</>;
}

export { parseInline };
