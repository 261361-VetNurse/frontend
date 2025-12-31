'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnersPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/pet-owners/homepage');
  }, [router]);

  return null;
}
