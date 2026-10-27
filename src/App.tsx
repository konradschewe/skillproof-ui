import { useState } from "react";
import { getData } from "./data";
import type { HubResult } from "./types";
import { MultiRepo } from "./views/MultiRepo";
import { SingleRepo } from "./views/SingleRepo";

export function App() {
  const data = getData();
  const [selected, setSelected] = useState<HubResult | null>(null);

  if (!data) {
    return (
      <div style={{ fontFamily: "var(--font)", padding: "2rem", color: "var(--muted)" }}>
        No data. Set <code>window.__SKILLPROOF_DATA__</code> or connect to an API.
      </div>
    );
  }

  if (data.mode === "single") return <SingleRepo report={data.report} />;

  if (data.mode === "multi") {
    if (selected) {
      return (
        <SingleRepo
          report={selected.report}
          breadcrumb={{ label: "← Hub", onClick: () => setSelected(null) }}
          repoUrl={selected.repoUrl}
        />
      );
    }
    return <MultiRepo results={data.results} onSelectRepo={setSelected} />;
  }
}
