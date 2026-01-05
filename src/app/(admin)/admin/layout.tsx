import Sidebar from '@/components/admin/layout/Sidebar';
import TopBarWrapper from '@/components/admin/layout/TopBarWrapper';
import Container from '@/components/pet-owners/layout/Container';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout flex flex-col bg-zinc-50">
      <TopBarWrapper />
      <div className="admin-main flex flex-1">
        <Sidebar />
        <main className="admin-content flex-1 overflow-auto fade-in">
          <Container width="100%">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
