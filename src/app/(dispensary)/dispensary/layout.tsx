export default function DispensaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-64 bg-white border-r border-zinc-200 p-4">
        <h2 className="text-lg font-semibold mb-4">DispensarySidebar</h2>
        <nav className="space-y-2">
          <div className="p-2 rounded hover:bg-zinc-100">Prescriptions</div>
          <div className="p-2 rounded hover:bg-zinc-100">Inventory</div>
          <div className="p-2 rounded hover:bg-zinc-100">Patients</div>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
