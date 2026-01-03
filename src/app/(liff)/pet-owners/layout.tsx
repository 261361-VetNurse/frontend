
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='w-full' style={{backgroundColor: '#F7F7F7'}}>
        <main style={{
            display: 'flex',
            justifyContent: 'center',
        }}>
          {children}
        </main>
    </div>
  );
}
