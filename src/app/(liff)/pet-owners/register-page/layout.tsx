import Container from '@/components/pet-owners/common/Container';

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
    </div>
    
  );
}
