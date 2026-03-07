'use client';

import { useEffect } from 'react';
import { useRouter } from '@/hooks/use-next-routing';

export default function OwnersPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/pet-owners/login-page');
  }, [router]);

  return null;
}
