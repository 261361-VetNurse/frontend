"use client";

interface TimePickerProps {
  size?: "sm" | "md";
  display?: "input" | "inline";
  value: string;              // "HH:mm"
  onChange: (t: string) => void;
  min?: string;               // "HH:mm"
  max?: string;               // "HH:mm"
  disabled?: boolean;
  error?: boolean;
}

export default function TimePicker({
  size = "md",
  display = "input",
  value,
  onChange,
  min,
  max,
  disabled = false,
  error = false,
}: TimePickerProps) {
  
  const normalize = (t: string) => t?.slice(0, 5) || "";

  const sizeCls =
    size === "sm"
      ? "h-9 text-sm"
      : "h-12 text-base";

  const borderCls = error
    ? "border-red-500"
    : "border-gray-300 dark:border-zinc-700";

  const disabledCls = disabled
    ? "opacity-50 pointer-events-none"
    : "cursor-pointer";

  if (display === "inline") {
    return (
      <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border inline-flex">
        <input
          type="time"
          value={normalize(value)}
          onChange={(e) => onChange(normalize(e.target.value))}
          min={min}
          max={max}
          disabled={disabled}
          className="outline-none bg-transparent text-gray-900 dark:text-zinc-200"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`
          flex items-center border rounded-lg bg-white dark:bg-zinc-900
          px-3 ${sizeCls} ${borderCls} ${disabledCls}
        `}
      >
        <input
            type="time"
            value={normalize(value)}
            onChange={(e) => onChange(normalize(e.target.value))}
            min={min}
            max={max}
            disabled={disabled}
            className="w-full bg-transparent outline-none text-gray-400 dark:text-zinc-500"
        />
      </div>
    </div>
  );
}
