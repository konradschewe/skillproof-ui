import { Fragment, type ReactNode } from "react";

function parseInline(text: string): ReactNode {
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  const parts: ReactNode[] = [];
  let last = 0, k = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined) parts.push(<strong key={k++}>{m[2]}</strong>);
    else parts.push(<code key={k++}>{m[3]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return <Fragment>{parts}</Fragment>;
}

export function renderMarkdown(text: string): ReactNode {
  const blocks = text.split(/\n\n+/);
  const nodes: ReactNode[] = [];

  for (let bi = 0; bi < blocks.length; bi++) {
    const lines = blocks[bi].split("\n").filter(Boolean);
    if (!lines.length) continue;

    type RunType = "p" | "ol" | "ul";
    type Run = { type: RunType; items: string[] };
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

    for (let ri = 0; ri < runs.length; ri++) {
      const { type, items } = runs[ri];
      const key = `${bi}-${ri}`;
      if (type === "ol") {
        nodes.push(
          <ol key={key}>
            {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
          </ol>
        );
      } else if (type === "ul") {
        nodes.push(
          <ul key={key}>
            {items.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
          </ul>
        );
      } else {
        nodes.push(<p key={key}>{parseInline(items.join(" "))}</p>);
      }
    }
  }

  return <>{nodes}</>;
}

export { parseInline };
