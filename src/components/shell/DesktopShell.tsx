import TopBar from '@/components/common/TopBar';

interface DesktopShellProps {
  children: React.ReactNode;
  Sidebar: React.ComponentType;
}

export default function DesktopShell({ children, Sidebar }: DesktopShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <TopBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
