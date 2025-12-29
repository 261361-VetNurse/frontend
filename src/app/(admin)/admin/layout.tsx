import Sidebar from '@/components/admin/layout/Sidebar';
import TopBarWrapper from '@/components/admin/layout/TopBarWrapper';
import Container from '@/components/common/Container';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-zinc-50">
      <TopBarWrapper />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Container paddingX={24}>
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
}
