"use client";

import React, { useMemo, useState } from "react";

/**
 * CalendarModule (shared)
 * Requirements
 * - Variants: size (compact|standard)
 * - weekStart: sun|mon
 * - showOutsideDays: boolean
 * - showMarkers: boolean
 * - States (day cell): default | today | selected | disabled | hasEvent
 * - Marker types: dot | badgeNumber
 * - markerColorKey: appointment | medication | record (ห้าม hardcode สีในแต่ละหน้า)
 * - Behavior: onSelectDate(date), onMonthChange(month)
 * - maxMarkersPerDay
 */

export type CalendarSize = "compact" | "standard";
export type WeekStart = "sun" | "mon";
export type MarkerColorKey = "appointment" | "medication" | "record";

export type DayMarker =
  | { type: "dot"; colorKey: MarkerColorKey }
  | { type: "badgeNumber"; colorKey: MarkerColorKey; value: number };

export type CalendarDayMeta = {
  date: Date;
  disabled?: boolean;
  markers?: DayMarker[];
};

export type CalendarProps = {
  size?: CalendarSize;
  weekStart?: WeekStart;
  showOutsideDays?: boolean;
  showMarkers?: boolean;

  /** วันที่เลือก (controlled) */
  selectedDate?: Date | null;

  /** เดือนที่กำลังดู (controlled) */
  month?: Date;

  /** meta ของแต่ละวัน (markers/disabled) */
  dayMeta?: CalendarDayMeta[];

  /** กันรก */
  maxMarkersPerDay?: number;

  /**
   * สีของ marker (tailwind class)
   * ✅ บังคับให้ส่งจาก "ที่เดียว" (theme/const กลาง)
   */
  markerPalette: Record<MarkerColorKey, string>;

  /** optional: กำหนดวันที่ disabled เพิ่มเติม */
  isDateDisabled?: (date: Date) => boolean;

  /** Behavior */
  onSelectDate?: (date: Date) => void;
  onMonthChange?: (month: Date) => void;

  /** optional: className wrapper */
  className?: string;

  /** optional: ให้ UI คล้าย card */
  variant?: "card" | "plain";
};

type Cell = { date: Date; inMonth: boolean };

export default function CalendarModule({
  size = "standard",
  weekStart = "sun",
  showOutsideDays = true,
  showMarkers = true,

  selectedDate = null,
  month,
  dayMeta = [],
  maxMarkersPerDay = 3,
  markerPalette,
  isDateDisabled,

  onSelectDate,
  onMonthChange,

  className = "",
  variant = "card",
}: CalendarProps) {
  const [innerMonth, setInnerMonth] = useState(() => startOfMonth(new Date()));
  const viewMonth = month ? startOfMonth(month) : innerMonth;

  const metaMap = useMemo(() => {
    const map = new Map<string, CalendarDayMeta>();
    for (const m of dayMeta) map.set(dateKey(m.date), m);
    return map;
  }, [dayMeta]);

  const grid: Cell[] = useMemo(
    () => buildGrid(viewMonth, weekStart),
    [viewMonth, weekStart]
  );

  const monthLabel = useMemo(() => formatMonthYear(viewMonth), [viewMonth]);

  const todayKey = dateKey(new Date());
  const selectedKey = selectedDate ? dateKey(selectedDate) : "";

  function setMonth(next: Date) {
    const normalized = startOfMonth(next);
    if (!month) setInnerMonth(normalized);
    onMonthChange?.(normalized);
  }

  const container =
    variant === "card"
      ? "rounded-2xl bg-white border border-zinc-100 shadow-sm p-4"
      : "";

  const weekdayRowClass =
    size === "compact"
      ? "mt-3 grid grid-cols-7 text-center text-[11px] text-zinc-400"
      : "mt-3 grid grid-cols-7 text-center text-xs text-zinc-400";

  const dayGridClass = "mt-1 grid grid-cols-7 gap-y-1";

  return (
    <div className={["w-full", container, className].join(" ")}>
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(addMonths(viewMonth, -1))}
          className="h-9 w-9 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition flex items-center justify-center text-zinc-700"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="text-sm font-semibold text-zinc-900">{monthLabel}</div>

        <button
          type="button"
          onClick={() => setMonth(addMonths(viewMonth, 1))}
          className="h-9 w-9 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition flex items-center justify-center text-zinc-700"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className={weekdayRowClass}>
        {weekdayLabels(weekStart).map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className={dayGridClass}>
        {grid.map((cell) => {
          const d = cell.date;
          const inMonth = cell.inMonth;

          if (!showOutsideDays && !inMonth) {
            return <div key={dateKey(d)} className="h-10" />;
          }

          const key = dateKey(d);
          const meta = metaMap.get(key);

          const disabled = Boolean(meta?.disabled) || Boolean(isDateDisabled?.(d));
          const markers = (meta?.markers ?? []).slice(0, maxMarkersPerDay);
          const hasEvent = markers.length > 0;

          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <DayCell
              key={key}
              size={size}
              date={d}
              inMonth={inMonth}
              isToday={isToday}
              isSelected={isSelected}
              disabled={disabled}
              hasEvent={hasEvent}
              showMarkers={showMarkers}
              markers={markers}
              markerPalette={markerPalette}
              onClick={() => {
                if (disabled) return;
                onSelectDate?.(d);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayCell({
  size,
  date,
  inMonth,
  isToday,
  isSelected,
  disabled,
  hasEvent,
  showMarkers,
  markers,
  markerPalette,
  onClick,
}: {
  size: CalendarSize;
  date: Date;
  inMonth: boolean;

  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
  hasEvent: boolean;

  showMarkers: boolean;
  markers: DayMarker[];
  markerPalette: Record<MarkerColorKey, string>;

  onClick: () => void;
}) {
  const h = "h-10";
  const base = "flex items-center justify-center rounded-xl transition relative w-full";

  const todayRing = isToday && !isSelected ? "ring-1 ring-sky-200" : "";
  const selectedStyle = isSelected
    ? "bg-white border border-zinc-200 shadow-sm"
    : "bg-transparent";

  const hover = disabled ? "cursor-not-allowed opacity-40" : "hover:bg-zinc-50";

  const textColor = inMonth ? "text-zinc-800" : "text-zinc-300";
  const font = isToday && !isSelected ? "font-semibold" : "font-normal";

  const hasEventHint =
    hasEvent && !isSelected && !showMarkers ? "font-semibold" : "";

  const textSize = size === "compact" ? "text-[13px]" : "text-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[base, h, hover, todayRing, selectedStyle, hasEventHint].join(" ")}
      aria-disabled={disabled}
    >
      <div className={[textSize, textColor, font].join(" ")}>
        {date.getDate()}
      </div>

      {showMarkers && markers.length > 0 ? (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {markers.map((m, i) => {
            if (m.type === "dot") {
              return (
                <span
                  key={`${m.type}-${m.colorKey}-${i}`}
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    isSelected ? "bg-zinc-300" : markerPalette[m.colorKey],
                  ].join(" ")}
                />
              );
            }

            const label = m.value > 99 ? "99+" : String(m.value);
            return (
              <span
                key={`${m.type}-${m.colorKey}-${i}`}
                className={[
                  "text-[10px] leading-none px-1.5 py-0.5 rounded-full text-white",
                  isSelected ? "bg-zinc-400" : markerPalette[m.colorKey],
                ].join(" ")}
              >
                {label}
              </span>
            );
          })}
        </div>
      ) : null}
    </button>
  );
}

/* ---------------- utils ---------------- */

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function dateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function formatMonthYear(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function weekdayLabels(weekStart: WeekStart) {
  const sun = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const mon = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  return weekStart === "mon" ? mon : sun;
}

export function buildGrid(month: Date, weekStart: WeekStart): Cell[] {
  const first = startOfMonth(month);
  const firstDow = first.getDay(); // 0=sun..6=sat

  const shift =
    weekStart === "mon" ? (firstDow === 0 ? 6 : firstDow - 1) : firstDow;

  const start = new Date(first);
  start.setDate(first.getDate() - shift);

  const cells: Cell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month.getMonth() });
  }
  return cells;
}

/** ✅ helper ปลอดภัย เวลา parse ISO "YYYY-MM-DD" */
export function isoToLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function localDateToISO(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
