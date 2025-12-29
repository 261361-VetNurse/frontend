export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-zinc-200 p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Admin</h2>
      <nav className="space-y-2">
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Dashboard</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Users</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Settings</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Reports</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Audit Logs</div>
      </nav>
    </aside>
  );
}
