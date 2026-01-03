import NavBar from '@/components/pet-owners/common/NavBar';
import Container from '@/components/pet-owners/common/Container';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <Container width={"393px"}>
        <main>
          {children}
        </main>
      </Container>
      <NavBar />
    </div>
    
  );
}
