import Container from '@/components/common/Container';
import NavBar from '@/components/common/NavBar';

export default function OwnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
        <Container maxWidth={"393px"} paddingX={"0px"}>
          <main>
            <div style={{padding: '8px 24px',backgroundColor: '#F7F7F7'}}>
              {children}
            </div>
          </main>
          <NavBar/>
        </Container>
    </div>
  );
}
