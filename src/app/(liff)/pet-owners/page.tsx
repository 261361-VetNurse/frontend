'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnersPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/pet-owners/login-page');
  }, [router]);

  return null;
}
