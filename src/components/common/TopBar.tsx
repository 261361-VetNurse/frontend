export default function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">VetNurse System</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded hover:bg-zinc-100">
          Notifications
        </button>
        <button className="p-2 rounded hover:bg-zinc-100">
          Profile
        </button>
      </div>
    </header>
  );
}
