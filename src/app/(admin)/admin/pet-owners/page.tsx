export default function PetOwnersPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold mb-6">Pet Owners</h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-6">
          <button className="pb-3 border-b-2 border-black font-medium">
            All Pet Owners
          </button>
          <button className="pb-3 text-gray-400 hover:text-black">
            Wait for Approve
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 rounded-lg border px-3 text-sm focus:outline-none"
            />

            <button className="h-10 px-4 border rounded-lg text-sm">
              Sort
            </button>

            <button className="h-10 px-4 border rounded-lg text-sm">
              Filter
            </button>
          </div>

          <button className="h-10 px-4 bg-black text-white rounded-lg text-sm">
            + Add
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b text-gray-500">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Line ID</th>
                <th className="px-4 py-3 text-left">Pet</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>

            <tbody>
              {/* Empty state */}
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-400">
                  No pet owners found
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer / Pagination placeholder */}
          <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-400 border-t">
            <span>Showing 0–0 from 0</span>
            <div className="flex gap-2">
              <button className="px-2 py-1 border rounded">&lt;</button>
              <button className="px-2 py-1 border rounded">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
