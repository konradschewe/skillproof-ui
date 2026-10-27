interface Crumb {
  label: string;
  onClick?: () => void;
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: ".3rem",
      fontSize: ".78rem", marginBottom: "1.25rem", flexWrap: "wrap",
    }}>
      {crumbs.map((c, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
          {i > 0 && <span style={{ color: "var(--text-subtle)" }}>/</span>}
          {c.onClick ? (
            <button
              onClick={c.onClick}
              style={{
                background: "none", border: "none", padding: 0,
                color: "var(--text-muted)", cursor: "pointer",
                fontFamily: "inherit", fontSize: "inherit",
                transition: "color .12s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              {c.label}
            </button>
          ) : (
            <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
