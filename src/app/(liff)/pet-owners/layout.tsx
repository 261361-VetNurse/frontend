import Container from '@/components/common/Container';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-w-[393px] bg-zinc-50 pb-16">
      <main>
        <Container maxWidth="393px">
          {children}
        </Container>
      </main>
    </div>
  );
}
