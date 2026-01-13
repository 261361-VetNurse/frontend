"use client";

import Image from "next/image";
import { useRef } from "react";

interface PetAvatarPickerProps {
  value: string;
  onChange: (url: string) => void;
}

export default function PetAvatarPicker({
  value,
  onChange,
}: PetAvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isDefault = value.includes("pet-paw.svg");

  function onPickFile(file: File | null) {
    if (!file) return;

    const url = URL.createObjectURL(file);
    onChange(url);
  }

  return (
    <div className="relative">
      {/* Container */}
      <div 
        className={`relative h-24 w-24 overflow-hidden rounded-full border-2 border-white shadow-sm flex items-center justify-center
          ${isDefault ? "bg-zinc-200" : "bg-zinc-200"}`}
      >
        {isDefault ? (
          <div className="relative h-12 w-12 opacity-30">
            <Image
              src="/pet-paw.svg"
              alt="Default pet icon"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <Image
            src={value}
            alt="Pet avatar"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* (Edit Button) */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-sky-300 grid place-items-center shadow-md active:scale-[0.9] transition-transform"
        aria-label="Change pet photo"
        title="Change pet photo"
      >
        <Image
          src="/edit.svg"
          alt="Edit"
          width={16}
          height={16}
        />
      </button>

      {/* Hidden Input*/}
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