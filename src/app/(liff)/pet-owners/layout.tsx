import Container from '@/components/common/Container';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="p-4 flex justify-center">
        <div className="w-full max-w-[393px]">
          {children}
        </div>
      </main>
    </div>
  );
}
