import Container from '@/components/pet-owners/layout/Container';
import NavBar from '@/components/pet-owners/layout/NavBar';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div>
      <Container width={"393px"}>
        <main>
          {children}
        </main>
      </Container>
    </div>
    
  );
}
