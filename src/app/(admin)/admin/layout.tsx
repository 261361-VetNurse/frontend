export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-64 bg-white border-r border-zinc-200 p-4">
        <h2 className="text-lg font-semibold mb-4">AdminSidebar</h2>
        <nav className="space-y-2">
          <div className="p-2 rounded hover:bg-zinc-100">Dashboard</div>
          <div className="p-2 rounded hover:bg-zinc-100">Users</div>
          <div className="p-2 rounded hover:bg-zinc-100">Settings</div>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
