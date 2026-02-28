"use client";

import React, { useMemo } from "react";
import RecordCard from "@/components/pet-owners/shared/records/RecordCard";

export type RecordItem = {
  id: string;
  petId: string;
  petName: string;
  petPid?: string;
  avatarUrl?: string;
  date: string;
  time: string;
  note: string;
  imageUrls?: string[];
};

type Props = {
  headerSlot?: React.ReactNode;
  selectorSlot?: React.ReactNode;
  fabSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;

  items: RecordItem[];
  selectedPetId: string | "all";

  title?: string;
  emptyText?: string;

  onClickItem?: (id: string) => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime12h(time24: string) {
  if (!time24) return "";

  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);

  if (Number.isNaN(h) || Number.isNaN(m)) {
    return time24;
  }

  const suffix = h >= 12 ? "P.M." : "A.M.";
  const hour12 = ((h + 11) % 12) + 1;

  return `${pad2(hour12)}.${pad2(m)} ${suffix}`;
}

function formatDateHeader(iso: string) {
  if (!iso) return "";

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function RecordScreen({
  headerSlot,
  selectorSlot,
  fabSlot,
  footerSlot,
  items,
  selectedPetId,
  title = "Records",
  emptyText = "No records",
  onClickItem,
}: Props) {
  // 🔹 Filter ตาม pet
  const filtered = useMemo(() => {
    return items.filter((r) =>
      selectedPetId === "all"
        ? true
        : String(r.petId) === String(selectedPetId)
    );
  }, [items, selectedPetId]);

  // 🔹 Group ตามวันที่
  const grouped = useMemo(() => {
    const map: Record<string, RecordItem[]> = {};

    for (const r of filtered) {
      const key = r.date || "unknown";

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(r);
    }

    return Object.entries(map).sort(
      ([a], [b]) =>
        new Date(b).getTime() - new Date(a).getTime()
    );
  }, [filtered]);

  return (
    <>
      {headerSlot}

      {selectorSlot && (
        <div className="mt-4">{selectorSlot}</div>
      )}

      <div className="mt-4 space-y-4">
        <div className="font-semibold text-zinc-900">
          {title}
        </div>

        {grouped.length === 0 ? (
          <div className="text-sm text-zinc-500">
            {emptyText}
          </div>
        ) : (
          grouped.map(([date, records]) => (
            <div key={date} className="space-y-3">
              {/* วันที่ */}
              {date !== "unknown" && (
                <div className="text-sm font-semibold text-zinc-800 border-b border-zinc-200 pb-1">
                  {formatDateHeader(date)}
                </div>
              )}

              {records.map((r) => (
                <RecordCard
                  key={r.id}
                  petName={r.petName}
                  time={formatTime12h(r.time)}
                  note={r.note}
                  avatarUrl={r.avatarUrl}
                  imageUrls={r.imageUrls ?? []}
                  onClick={() =>
                    onClickItem?.(r.id)
                  }
                />
              ))}
            </div>
          ))
        )}
      </div>
  
      {fabSlot}

      {footerSlot}
    </>
  );
}