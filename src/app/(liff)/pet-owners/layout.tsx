export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 p-4">
        <h1 className="text-lg font-semibold">Owners</h1>
      </header>
      <main className="p-4 flex justify-center">
        <div className="w-full max-w-[448px]">
          {children}
        </div>
      </main>
    </div>
  );
}
