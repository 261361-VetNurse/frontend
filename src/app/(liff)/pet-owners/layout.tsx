import Container from '@/components/common/Container';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <div className="min-h-screen min-w-[393px] bg-zinc-50 pb-16">
      <main>
        <Container maxWidth="393px">
          {children}
        </Container>
=======
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 p-4">
        <h1 className="text-lg font-semibold">Owners</h1>
      </header>
      <main className="p-4 flex justify-center">
        <div className="w-full max-w-[393px]">
          {children}
        </div>
>>>>>>> icy_nomz
      </main>
    </div>
  );
}
