"use client";

import React, { useMemo } from "react";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
} from "@/components/pet-owners/shared/CalendarModule";

import RecordDateSection from "@/components/pet-owners/shared/records/RecordDateSection";
import RecordCard from "@/components/pet-owners/shared/records/RecordCard";

export type RecordItem = {
  id: string;

  petId: string;
  petName: string;
  petPid?: string;
  avatarUrl?: string;

  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  note: string;
  imageUrls?: string[];
};

type MarkerMode = "dot" | "count";

type Props = {
  // slots: ให้หน้าที่เรียกจัด layout เอง
  headerSlot?: React.ReactNode;
  selectorSlot?: React.ReactNode;
  fabSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;

  // data + filters
  items: RecordItem[];
  selectedPetId: string | "all";
  selectedDateISO: string; // YYYY-MM-DD
  onChangeSelectedDateISO: (iso: string) => void;

  // calendar markers
  markerMode?: MarkerMode; // default = "dot"
  markerPalette?: Record<string, string>;

  // list title
  title?: string;
  emptyText?: string;

  // interactions
  onClickItem?: (id: string) => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  return new Date(y, (m || 1) - 1, d || 1);
}

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function todayISO() {
  return toISODate(new Date());
}

function isTodayISO(iso: string) {
  return iso === todayISO();
}

function formatHeaderDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;

  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${weekday}, ${dd}/${mm}/${yyyy}`;
}

function formatTime12h(time24: string) {
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;

  const suffix = h >= 12 ? "P.M." : "A.M.";
  const hour12 = ((h + 11) % 12) + 1;
  return `${pad2(hour12)}.${pad2(m)} ${suffix}`;
}

export default function RecordScreen({
  headerSlot,
  selectorSlot,
  fabSlot,
  footerSlot,

  items,
  selectedPetId,
  selectedDateISO,
  onChangeSelectedDateISO,

  markerMode = "dot",
  markerPalette,

  title,
  emptyText = "No records",

  onClickItem,
}: Props) {
  const palette = markerPalette ?? {
    appointment: "bg-sky-500",
    medication: "bg-emerald-500",
    record: "bg-pink-400",
  };

  // list filter (ตาม pet + วัน)
  const filtered = useMemo(() => {
    return items
      .filter((r) => {
        const okPet =
          selectedPetId === "all"
            ? true
            : String(r.petId) === String(selectedPetId);
        const okDate = r.date === selectedDateISO;
        return okPet && okDate;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [items, selectedPetId, selectedDateISO]);

  // calendar dayMeta
  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    // dot mode (จุดเดียวพอ): mark ทุกวันที่มี record
    if (markerMode === "dot") {
      const set = new Set<string>();
      for (const r of items) {
        const okPet =
          selectedPetId === "all"
            ? true
            : String(r.petId) === String(selectedPetId);
        if (okPet) set.add(r.date);
      }

      return Array.from(set).map((iso) => ({
        date: parseISO(iso),
        markers: [{ type: "dot", colorKey: "record" }],
      }));
    }

    // count mode: 1 = dot, มากกว่า 1 = badgeNumber
    const countByDate: Record<string, number> = {};
    for (const r of items) {
      const okPet =
        selectedPetId === "all"
          ? true
          : String(r.petId) === String(selectedPetId);
      if (!okPet) continue;
      countByDate[r.date] = (countByDate[r.date] ?? 0) + 1;
    }

    return Object.entries(countByDate).map(([iso, count]) => {
      const markers: DayMarker[] =
        count <= 1
          ? [{ type: "dot", colorKey: "record" }]
          : [{ type: "badgeNumber", colorKey: "record", value: count }];

      return { date: parseISO(iso), markers };
    });
  }, [markerMode, items, selectedPetId]);

  const listTitle = useMemo(() => {
    if (title) return title;
    return isTodayISO(selectedDateISO) ? "Today record" : "Record";
  }, [selectedDateISO, title]);

  const headerDateLine = useMemo(() => {
    return isTodayISO(selectedDateISO) ? null : formatHeaderDate(selectedDateISO);
  }, [selectedDateISO]);

  return (
    <>
      {headerSlot}

      {selectorSlot ? <div className="mt-4">{selectorSlot}</div> : null}

      {/* Calendar */}
      <div className="mt-4">
        <CalendarModule
          size="standard"
          weekStart="sun"
          showOutsideDays
          showMarkers
          maxMarkersPerDay={1}
          selectedDate={parseISO(selectedDateISO)}
          dayMeta={dayMeta}
          markerPalette={palette}
          onSelectDate={(d) => onChangeSelectedDateISO(toISODate(d))}
        />
      </div>

      {/* List */}
      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <div className="font-semibold text-zinc-900">{listTitle}</div>

          {headerDateLine && (
            <div className="text-sm text-zinc-800 border-b border-zinc-200 pb-2">
              {headerDateLine}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-zinc-500">{emptyText}</div>
        ) : (
          <RecordDateSection
            label={headerDateLine ? "" : formatHeaderDate(selectedDateISO)}
          >
            {filtered.map((r) => (
              <RecordCard
                key={r.id}
                petName={r.petName}
                time={formatTime12h(r.time)}
                note={r.note}
                avatarUrl={r.avatarUrl}
                imageUrls={r.imageUrls ?? []}
                onClick={() => onClickItem?.(r.id)}
              />
            ))}
          </RecordDateSection>
        )}
      </div>

      {fabSlot}
      {footerSlot}
    </>
  );
}
