import Container from '@/components/pet-owners/common/Container';

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='w-full' style={{backgroundColor: '#F7F7F7'}}>
        <main>
          {children}
        </main>
    </div>
  );
}
