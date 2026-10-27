interface Props {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header-logo">Skillproof</span>
      </header>
      <div className="app-body">
        {sidebar && <aside className="app-sidebar">{sidebar}</aside>}
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
