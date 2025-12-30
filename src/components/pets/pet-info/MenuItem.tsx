"use client";

import Image from "next/image";

export default function MenuItem({
  iconSrc,
  title,
  onClick,
}: {
  iconSrc: string;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-white shadow-sm border border-zinc-100 px-4 py-4 flex items-center justify-between hover:bg-zinc-50 active:scale-[0.99] transition"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100">
          <Image src={iconSrc} alt="" width={20} height={20} />
        </span>
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
      </div>

      <span className="text-zinc-400 text-xl leading-none">›</span>
    </button>
  );
}
