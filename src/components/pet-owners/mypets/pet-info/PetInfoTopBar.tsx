"use client";

import Image from "next/image";

export default function PetInfoTopBar({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="relative px-4 pt-4 h-12 flex items-center">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center"
        aria-label="Back"
      >
        <Image src="/back.svg" alt="Back" width={22} height={22} />
      </button>

      {/* Center title */}
      <div className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-zinc-900">
        {title}
      </div>
    </div>
  );
}
