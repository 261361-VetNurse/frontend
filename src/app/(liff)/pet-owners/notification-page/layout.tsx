import NavBar from '@/components/pet-owners/layout/NavBar';
import Container from '@/components/pet-owners/layout/Container';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className='flex flex-col items-center justify-center'>
      <Container width={"393px"}>
        <main>
          {children}
        </main>
      </Container>
      <NavBar />
    </div>
    
  );
}
