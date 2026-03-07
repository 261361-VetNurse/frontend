"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from '@/components/shared/Image';
import { PetLite } from "@/types/domain/pet";
import Profile from "@/components/pet-owners/shared/Profile";

type Mode = "filter" | "formField";
type Size = "sm" | "md" | string;
type VisualState = "default" | "disabled" | "error";

type Props = {
  mode?: Mode;

  /** true = มี All Pets, 
   * false = ไม่มีตัวเลือก All */
  allowAllPets?: boolean;

  size?: Size;
  state?: VisualState;

  pets: PetLite[];
  value: number | null;
  onChange: (value: number | null) => void;

  // formField extras
  label?: string;
  hint?: string;
  errorText?: string;

  placeholder?: string;
};

export default function PetFilterSelector({
  mode = "filter",
  allowAllPets = true,
  size = "md",
  state = "default",
  pets,
  value,
  onChange,
  label,
  hint,
  errorText,
  placeholder = "Select your pet",
}: Props) {
  const disabled = state === "disabled";
  const isError = state === "error";

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedPet = useMemo(() => {
    if (value === 0) return null;
    return pets.find((p) => p.pet_id === value) ?? null;
  }, [pets, value]);

  const ui = useMemo(() => {
    const pad = size === "sm" ? "px-3 py-2" : "px-4 py-3";
    const round = "rounded-2xl";
    const border = isError
      ? "border-red-300 focus:ring-red-200"
      : "border-zinc-200 focus:ring-sky-200";
    const dis = disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer";
    return { pad, round, border, dis };
  }, [size, disabled, isError]);

  function pick(v: number) {
    if (disabled) return;
    onChange(v);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      {mode === "formField" && label ? (
        <label className="block text-sm font-medium text-zinc-800 mb-1">
          {label}
        </label>
      ) : null}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          "w-full flex items-center justify-between gap-3 bg-white border outline-none shadow-sm",
          ui.round,
          ui.pad,
          ui.border,
          ui.dis,
          "focus:ring-2",
        ].join(" ")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="min-w-0 flex items-center gap-3">
          <Profile
            imageUrl={selectedPet?.profile_image ?? ""}
            size="40px"
            isPet={true}
          />
          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-semibold text-zinc-900">
              {allowAllPets && value === 0
                ? "All Pets"
                : selectedPet?.name ?? placeholder}
            </div>

            {allowAllPets && value === 0 ? (
              <div className="text-xs text-zinc-500"> </div>
            ) : (
              <div className="truncate text-xs text-zinc-500">
                {selectedPet?.pet_id ? `PID: ${selectedPet.pet_id}` : " "}
              </div>
            )}
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
      </button>

      {/* helper / error */}
      {mode === "formField" ? (
        <div className="mt-1">
          {isError ? (
            <p className="text-xs text-red-600">
              {errorText ?? "Invalid value"}
            </p>
          ) : hint ? (
            <p className="text-xs text-zinc-500">{hint}</p>
          ) : null}
        </div>
      ) : null}

      {/* Dropdown */}
      {open ? (
        <div
          className="
            absolute left-0 right-0 top-full mt-2
            rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden
            z-50
          "
        >
          <div role="listbox" className="max-h-72 overflow-auto">
            {allowAllPets ? (
              <PetRow
                key="all"
                active={value === 0}
                onClick={() => pick(0)}
                size={size}
                name="All Pets"
                isAll
              />
            ) : null}

            {pets.length === 0 ? (
              <div className="px-4 py-3 text-sm text-zinc-500">No pets</div>
            ) : (
              pets.map((p) => (
                <PetRow
                  key={p.pet_id}
                  active={value === p.pet_id}
                  onClick={() => pick(p.pet_id)}
                  size={size}
                  name={p.name}
                  pid={p.pet_id}
                  profile_image={p.profile_image}
                />
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PetRow({
  active,
  onClick,
  size,
  name,
  pid,
  profile_image,
  isAll,
}: {
  active?: boolean;
  onClick: () => void;
  size: "sm" | "md" | string;
  name: string;
  pid?: number;
  profile_image?: string | null;
  isAll?: boolean;
}) {
  const pad = size === "sm" ? "px-3 py-2" : "px-4 py-3";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left flex items-center justify-between gap-3",
        pad,
        active ? "bg-zinc-50" : "hover:bg-zinc-50",
      ].join(" ")}
    >
      <div className="min-w-0 flex items-center gap-3">
        {isAll ? (
          <Profile
            imageUrl="https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/blank_pet_profile_1x.webp"
            alt="All pets"
            size="44px"
            isPet={true}
          />

        ) : (
          <Profile
            imageUrl={profile_image}
            alt={name}
            size="44px"
          />
        )}

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900">
            {name}
          </div>
          <div className="truncate text-xs text-zinc-500">
            {pid ? `PID: ${pid}` : " "}
          </div>
        </div>
      </div>

      {active ? <span className="text-zinc-700">✓</span> : null}
    </button>
  );
}
