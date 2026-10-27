interface Props {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header-logo">Skillproof</span>
        <div className="app-header-right">
          {/* user profile placeholder */}
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: ".7rem", color: "rgba(255,255,255,.6)",
          }}>
            👤
          </div>
        </div>
      </header>
      <div className="app-body">
        {sidebar && <aside className="app-sidebar">{sidebar}</aside>}
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
