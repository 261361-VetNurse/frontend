"use client";

import { BackButton } from '@/styles/components/shared-component.styled';
import Image from 'next/image';

export default function PetInfoTopBar({
  title,
  onBack,
}: {
  title: string;
  backPageUrl?: string;
  onBack: () => void;
}) {

  return (
    <div className="relative pt-4 w-full flex items-center">
      {/* Back button */}
      <BackButton onClick={onBack} aria-label="back">
        <Image src="/back-arrow.svg" alt="back" width={32} height={32} />
      </BackButton>

      {/* Center title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-zinc-900">
        {title}
      </div>
    </div>
  );
}
