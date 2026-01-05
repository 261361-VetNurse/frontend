"use client";

import Image from "next/image";
import { useRef } from "react";

export default function PetAvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onPickFile(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange(url);
  }

  return (
    <div className="relative">
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-zinc-200">
        <Image src={value} alt="Pet avatar" fill className="object-cover" />
      </div>

      {/* edit button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-sky-500 grid place-items-center shadow-md active:scale-[0.98] transition"
        aria-label="Change pet photo"
        title="Change pet photo"
      >
        <Image
          src="/edit.svg"
          alt=""
          width={16}
          height={16}
          className="pointer-events-none -scale-x-100" 
        />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
