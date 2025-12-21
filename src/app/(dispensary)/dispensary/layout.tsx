import DesktopShell from '@/components/shell/DesktopShell';
import DispensarySidebar from '@/components/dispensary/DispensarySidebar';

export default function DispensaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesktopShell Sidebar={DispensarySidebar}>
      {children}
    </DesktopShell>
  );
}
