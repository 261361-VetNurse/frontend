"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Pet } from "@/types/pet";

type Mode = "filter" | "formField";
type Size = "sm" | "md";
type VisualState = "default" | "disabled" | "error";

export type PetSelectorValue = string | "all";

type Props = {
  mode?: Mode;

  /** true = มี All Pets, 
   * false = ไม่มีตัวเลือก All */
  allowAllPets?: boolean;

  size?: Size;
  state?: VisualState;

  pets: Pet[];
  value: PetSelectorValue;
  onChange: (value: PetSelectorValue) => void;

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
    if (value === "all") return null;
    return pets.find((p) => p._id === value) ?? null;
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

  function pick(v: PetSelectorValue) {
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
          {allowAllPets && value === "all" ? (
            <div className="relative h-11 w-11 rounded-full bg-zinc-100 overflow-hidden">
              <Image
                src="/pet-paw.svg"
                alt="All pets"
                fill
                className="object-contain p-2"
              />
            </div>

          ) : (
            <div className="relative h-11 w-11 overflow-hidden rounded-full bg-zinc-100">
              <Image
                src={selectedPet?.profile_image ?? "/pet-placeholder.svg"}
                alt={selectedPet?.name ?? "Pet"}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 text-left">
            <div className="truncate text-sm font-semibold text-zinc-900">
              {allowAllPets && value === "all"
                ? "All Pets"
                : selectedPet?.name ?? placeholder}
            </div>

            {allowAllPets && value === "all" ? (
              <div className="text-xs text-zinc-500"> </div>
            ) : (
              <div className="truncate text-xs text-zinc-500">
                {selectedPet?._id ? `PID: ${selectedPet._id}` : " "}
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
                active={value === "all"}
                onClick={() => pick("all")}
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
                  key={p._id}
                  active={value === p._id}
                  onClick={() => pick(p._id)}
                  size={size}
                  name={p.name}
                  pid={p._id}
                  avatarUrl={p.profile_image}
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
  avatarUrl,
  isAll,
}: {
  active?: boolean;
  onClick: () => void;
  size: "sm" | "md";
  name: string;
  pid?: string;
  avatarUrl?: string;
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
          <div className="relative h-11 w-11 rounded-full bg-zinc-100 overflow-hidden">
            <Image
              src="/pet-paw.svg"
              alt="All pets"
              fill
              className="object-contain p-2"
            />
          </div>

        ) : (
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-100">
            <Image
              src={avatarUrl ?? "/pet-placeholder.svg"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
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
