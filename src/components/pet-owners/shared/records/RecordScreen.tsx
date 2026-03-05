"use client";

import React, { useMemo } from "react";
import RecordCard from "@/components/pet-owners/shared/records/RecordCard";
import type { SymptomRecord } from "@/types/domain/symptom";

type Props = {
  headerSlot?: React.ReactNode;
  selectorSlot?: React.ReactNode;
  fabSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;

  items: SymptomRecord[];
  selectedPetId: string | "all";

  title?: string;
  emptyText?: string;

  onClickItem?: (id: number) => void;
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
        : String(r.pet_id) === String(selectedPetId)
    );
  }, [items, selectedPetId]);

  // 🔹 Group ตามวันที่
  const grouped = useMemo(() => {
    const map: Record<string, SymptomRecord[]> = {};

    for (const r of filtered) {
      const key = r.date_added || "unknown";

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
                  key={r.record_id}
                  petName={r.pet_name}
                  time={formatTime12h(r.time_added)}
                  note={r.note}
                  avatarUrl={r.pet_image}
                  imageUrls={r.note_image ?? []}
                  onClick={() =>
                    onClickItem?.(r.record_id)
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