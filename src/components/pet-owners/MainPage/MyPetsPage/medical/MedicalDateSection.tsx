"use client";

import type React from "react";
import Image from "next/image";

type Props = {
  label?: string; 
  children: React.ReactNode;

  editing?: boolean;
  onToggleEdit?: () => void;

  editIconSrc?: string;
};

export default function MedicalDateSection({
  label = "",
  children,
  editing = false,
  onToggleEdit,
  editIconSrc = "/icons/pencil.svg",
}: Props) {
  return (
    <section>
      {label ? (
        <>
          {/* header row: วันที่ + ปุ่มปากกา */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900">{label}</div>

            {onToggleEdit ? (
              <button
                type="button"
                onClick={onToggleEdit}
                className="h-9 w-9 -mr-2 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition flex items-center justify-center"
                aria-label={editing ? "Done" : "Edit"}
                title={editing ? "Done" : "Edit"}
              >
                <Image
                  src={editIconSrc}
                  alt="Edit"
                  width={18}
                  height={18}
                  className={editing ? "opacity-100" : "opacity-80"}
                />
              </button>
            ) : null}
          </div>

          <div className="mt-2 border-b border-zinc-200" />
        </>
      ) : null}

      <div className={label ? "mt-3 space-y-2" : "space-y-2"}>{children}</div>
    </section>
  );
}
