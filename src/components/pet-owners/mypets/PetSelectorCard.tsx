"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PetOption = {
  id: string;
  name: string;
  pid?: string;
  imageUrl?: string;
};

export default function PetSelectorCard({
  name,
  pid,
  imageUrl,
  options,
  selectedId,
  onSelect,
}: {
  name: string;
  pid?: string;
  imageUrl?: string;

  options: PetOption[];
  selectedId?: string;
  onSelect: (petId: string) => void;
}) {
  const imageSrc = imageUrl ?? "/pet-placeholder.svg";
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      {/* Card */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
      >
        <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-4 flex items-center justify-between hover:bg-zinc-50 active:scale-[0.99] transition">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full bg-zinc-100">
              <Image src={imageSrc} alt={name} fill className="object-cover" />
            </div>

            <div>
              <div className="text-sm font-semibold text-zinc-900">{name}</div>
              <div className="text-xs text-zinc-500">{`PID: ${pid ?? "-"}`}</div>
            </div>
          </div>

          {/* ▼ Down icon */}
          <div
            className={[
              "relative h-5 w-5 transition-transform duration-200",
              open ? "rotate-180" : "",
            ].join(" ")}
          >
            <Image
              src="/down-icon.svg"
              alt="Toggle pet selector"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-[360px] max-w-[92vw]
            rounded-2xl bg-white shadow-lg border border-zinc-100
            overflow-hidden
          "
        >
          <div className="max-h-[240px] overflow-auto p-2">
            {options.map((p) => {
              const active = p.id === selectedId;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onSelect(p.id);
                  }}
                  className={[
                    "w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left",
                    active ? "bg-zinc-50" : "hover:bg-zinc-50",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full bg-zinc-100 shrink-0">
                      <Image
                        src={p.imageUrl ?? "/pet-placeholder.svg"}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-zinc-900">
                        {p.name}
                      </div>
                      <div className="text-xs text-zinc-500">{`PID: ${
                        p.pid ?? "-"
                      }`}</div>
                    </div>
                  </div>

                  {active ? (
                    <span className="text-sm text-zinc-600">✓</span>
                  ) : (
                    <span className="text-zinc-400 text-lg">›</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
