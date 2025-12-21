import DesktopShell from '@/components/shell/DesktopShell';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesktopShell Sidebar={AdminSidebar}>
      {children}
    </DesktopShell>
  );
}
