"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewPetButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/pet-owners/mypets/new")}
      className="flex flex-col items-center gap-1 transition active:scale-[0.97]"
      aria-label="Add new pet"
      title="Add new pet"
    >
      <Image
        src="/add-new.svg"
        alt="Add new pet"
        width={40}
        height={40}
        className="pointer-events-none"
        priority
      />

      <span className="text-[11px] font-medium text-zinc-500 leading-none">
        New Pet
      </span>
    </button>
  );
}
