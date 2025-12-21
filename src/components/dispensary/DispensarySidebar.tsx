export default function DispensarySidebar() {
  return (
    <aside className="w-64 bg-white border-r border-zinc-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Dispensary</h2>
      <nav className="space-y-2">
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Prescriptions</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Inventory</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Patients</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Medications</div>
        <div className="p-2 rounded hover:bg-zinc-100 cursor-pointer">Reports</div>
      </nav>
    </aside>
  );
}
