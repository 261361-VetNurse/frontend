"use client";

import { useMemo, useState } from "react";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (isoDate: string) => void;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  return `${yyyy}-${mm}-${dd}`;
}

function parseISO(iso: string) {
  // iso: YYYY-MM-DD
  const [y, m, d] = iso.split("-").map((x) => Number(x));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function SymptomCalendar({ value, onChange }: Props) {
  const selectedDate = useMemo(() => parseISO(value), [value]);
  const today = useMemo(() => new Date(), []);

  // month cursor
  const [cursor, setCursor] = useState(() => {
    // start at selected month
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });

  const monthLabel = useMemo(() => {
    return cursor.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [cursor]);

  const days = useMemo(() => {
    // build 6x7 grid
    const startOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const endOfMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

    const firstWeekday = startOfMonth.getDay(); // 0..6
    const totalDaysInMonth = endOfMonth.getDate();

    // previous month tail
    const prevMonthEnd = new Date(cursor.getFullYear(), cursor.getMonth(), 0);
    const prevMonthDays = prevMonthEnd.getDate();

    const cells: { date: Date; inMonth: boolean }[] = [];

    // fill leading
    for (let i = 0; i < firstWeekday; i++) {
      const dayNum = prevMonthDays - (firstWeekday - 1 - i);
      cells.push({
        date: new Date(cursor.getFullYear(), cursor.getMonth() - 1, dayNum),
        inMonth: false,
      });
    }

    // fill current
    for (let d = 1; d <= totalDaysInMonth; d++) {
      cells.push({
        date: new Date(cursor.getFullYear(), cursor.getMonth(), d),
        inMonth: true,
      });
    }

    // fill trailing to 42 cells
    while (cells.length < 42) {
      const nextDay = cells.length - (firstWeekday + totalDaysInMonth) + 1;
      cells.push({
        date: new Date(cursor.getFullYear(), cursor.getMonth() + 1, nextDay),
        inMonth: false,
      });
    }

    return cells;
  }, [cursor]);

  function prevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }

  return (
    <div className="rounded-2xl bg-white border border-zinc-100 shadow-sm p-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="h-9 w-9 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition flex items-center justify-center text-zinc-700"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="text-sm font-semibold text-zinc-900">{monthLabel}</div>

        <button
          type="button"
          onClick={nextMonth}
          className="h-9 w-9 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition flex items-center justify-center text-zinc-700"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="mt-3 grid grid-cols-7 text-center text-xs text-zinc-400">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {days.map((cell, idx) => {
          const d = cell.date;
          const inMonth = cell.inMonth;

          const selected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(toISODate(d))}
              className={[
                "h-10 flex items-center justify-center rounded-xl transition relative",
                selected
                  ? "bg-white border border-zinc-200 shadow-sm"
                  : "hover:bg-zinc-50",
              ].join(" ")}
            >
              <div
                className={[
                  "text-sm",
                  inMonth ? "text-zinc-800" : "text-zinc-300",
                  isToday && !selected ? "font-semibold" : "",
                ].join(" ")}
              >
                {d.getDate()}
              </div>

              {/* dots under selected day (เหมือนรูป) */}
              {selected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  <span className="h-1 w-1 rounded-full bg-pink-400" />
                  <span className="h-1 w-1 rounded-full bg-pink-400" />
                  <span className="h-1 w-1 rounded-full bg-pink-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
