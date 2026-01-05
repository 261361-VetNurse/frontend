"use client";

import { BackButton } from '@/styles/sharedComponet.styled';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useRouter } from 'next/navigation';

export default function PetInfoTopBar({
  title,
  onBack,
}: {
  title: string;
  backPageUrl?: string;
  onBack: () => void;
}) {
const router = useRouter();

  return (
    <div className="relative pt-4 w-full flex items-center">
      {/* Back button */}
      <BackButton onClick={onBack} aria-label="back">
        <ArrowBackIosNewIcon />
      </BackButton>

      {/* Center title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-zinc-900">
        {title}
      </div>
    </div>
  );
}
