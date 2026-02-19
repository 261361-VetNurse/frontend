import Container from '@/components/pet-owners/layout/Container';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
      <Container padding={"0px"}>
        <main style={{ width: '100%' }}>
          {children}
        </main>
      </Container>
    </div>

  );
}