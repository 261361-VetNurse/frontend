export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full" style={{ backgroundColor: '#F7F7F7' }}>
      <main
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
