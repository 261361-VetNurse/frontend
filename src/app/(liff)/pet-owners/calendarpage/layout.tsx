import Container from '@/components/common/Container';
import NavBar from '@/components/common/NavBar';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full" style={{backgroundColor: '#F7F7F7'}}>
        <Container maxWidth={"393px"} paddingX={"0px"}>
          <main>
            <div style={{padding: '8px 24px'}}>
              {children}
            </div>
          </main>
          <NavBar/>
        </Container>
    </div>
  );
}