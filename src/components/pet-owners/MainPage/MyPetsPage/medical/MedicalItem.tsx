"use client";

import Image from "next/image";

type Props = {
  time: string; // เช่น "10.52 น." หรือ "11.00 A.M."
  note: string; // เช่น "เข้าห้องตรวจ"
  onClick?: () => void;

  // ✅ เพิ่มสำหรับโหมดลบ
  showDelete?: boolean;
  onDelete?: () => void;
  deleteIconSrc?: string;
};

export default function MedicalItem({
  time,
  note,
  onClick,
  showDelete = false,
  onDelete,
  deleteIconSrc = "/icons/trash.svg",
}: Props) {
  const Wrapper: any = onClick ? "button" : "div";

  return (
    <div
      className={[
        "w-full",
        "flex items-start justify-between gap-3",
        onClick ? "hover:bg-zinc-50 rounded-xl px-2 -mx-2" : "",
      ].join(" ")}
    >
      {/* left content */}
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={[
          "flex-1 text-left",
          "grid grid-cols-[18px_72px_1fr] items-start gap-3",
          "py-2",
        ].join(" ")}
      >
        {/* bullet */}
        <div className="text-zinc-500 leading-5">•</div>

        {/* time */}
        <div className="text-sm text-zinc-500 tabular-nums">{time}</div>

        {/* note */}
        <div className="text-sm text-zinc-700">{note}</div>
      </Wrapper>

      {/* delete button (only in edit mode) */}
      {showDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="mt-1 h-9 w-9 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition flex items-center justify-center"
          aria-label="Delete"
          title="Delete"
        >
          <Image src={deleteIconSrc} alt="Delete" width={18} height={18} />
        </button>
      ) : null}
    </div>
  );
}
