"use client";

import { format } from "date-fns";

const FORMAT_DATE = "yyyy-MM-dd";
const FORMAT_TIME = "HH:mm";
const FORMAT_DATETIME = "yyyy-MM-dd'T'HH:mm";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (v: Date | null) => void;
  size?: "sm" | "md";
  mode?: "date" | "time" | "datetime";
  display?: "input" | "inline";
  disabled?: boolean;
  error?: boolean;
  min?: Date | null;
  max?: Date | null;
}

export default function DateTimePicker({
  value,
  onChange,
  size = "md",
  mode = "date",
  display = "input",
  disabled,
  error,
  min,
  max,
}: DateTimePickerProps) {
  const getFormat = () => {
    if (mode === "date") return FORMAT_DATE;
    if (mode === "time") return FORMAT_TIME;
    return FORMAT_DATETIME;
  };

  const displayValue = value ? format(value, getFormat()) : "";
  const minValue = min ? format(min, getFormat()) : undefined;
  const maxValue = max ? format(max, getFormat()) : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value ? new Date(e.target.value) : null);
  };

  const sizeClass =
    size === "sm" ? "h-9 text-sm" : "h-12 text-base";

  if (display === "inline") {
    return (
      <div>
        {mode === "date" && (
          <input
            type="date"
            value={displayValue}
            onChange={handleChange}
            min={minValue}
            max={maxValue}
          />
        )}
        {mode === "time" && (
          <input
            type="time"
            value={displayValue}
            onChange={handleChange}
          />
        )}
        {mode === "datetime" && (
          <input
            type="datetime-local"
            value={displayValue}
            onChange={handleChange}
            min={minValue}
            max={maxValue}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center border rounded-lg bg-white dark:bg-zinc-900 px-3 cursor-pointer ${sizeClass}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${error ? "border-red-500" : "border-zinc-300"}
      `}
    >
      <input
        disabled={disabled}
        type={
          mode === "date"
            ? "date"
            : mode === "time"
            ? "time"
            : "datetime-local"
        }
        value={displayValue}
        onChange={handleChange}
        min={minValue}
        max={maxValue}
        className="w-full bg-transparent outline-none"
      />
    </div>
  );
}
