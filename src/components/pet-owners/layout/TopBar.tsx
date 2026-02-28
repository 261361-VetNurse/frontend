"use client";

import { BackButton } from '@/styles/components/shared-component.styled';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

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
        <ArrowBackIosNewIcon />
      </BackButton>

      {/* Center title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-zinc-900">
        {title}
      </div>
    </div>
  );
}
