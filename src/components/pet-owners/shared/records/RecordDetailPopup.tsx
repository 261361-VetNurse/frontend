"use client";

import Image from "next/image";
import Profile from "../Profile";
import { FormDialog } from "../FormDialog";
import { SymptomRecord } from "@/types/domain/symptom";

type Props = {
  open: boolean;
  record: SymptomRecord | null;
  onClose: () => void;
  onEdit?: (rec: SymptomRecord) => void;
  onDelete?: (id: number) => void;

  formatTime?: (t: string) => string;
};

function formatDateLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function RecordDetailPopup({
  open,
  record,
  onClose,
  onEdit,
  onDelete,
  formatTime,
}: Props) {
  if (!open || !record) return null;

  const timeText = formatTime ? formatTime(record.time_added) : record.time_added;
  const dateText = formatDateLabel(record.date_added ?? "");
  const images = record.note_image ?? [];

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Record"
      primaryLabel="Edit"
      onPrimary={() => onEdit?.(record)}
      secondaryLabel="Delete"
      onSecondary={() => onDelete?.(record.record_id)}
    >
      {/* Pet row */}
      <div className="flex items-center gap-3 mb-2">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100">
          <Profile
            imageUrl={record.pet_image}
            alt={record.pet_name}
            size="small"
          />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">
            {record.pet_name}
          </div>
          <div className="text-xs text-zinc-500 truncate">{`PID: ${record.pet_id}`}</div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4">
        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3 text-sm text-zinc-800">
          <div>
            <div className="font-medium">Date</div>
            <div className="mt-1 text-zinc-700">{dateText}</div>
          </div>
          <div>
            <div className="font-medium">Time</div>
            <div className="mt-1 text-zinc-700">{timeText}</div>
          </div>
        </div>

        {/* Note */}
        <div>
          <div className="text-sm font-medium text-zinc-800">Note</div>
          <div className="mt-1 text-sm text-zinc-700 whitespace-pre-wrap">
            {record.note}
          </div>
        </div>

        {/* Images */}
        <div>
          <div className="text-sm font-medium text-zinc-800">Image</div>

          {images.length === 0 ? (
            <div className="mt-2 text-sm text-zinc-400">No images</div>
          ) : (
            <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
              {images.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className="relative h-40 w-40 shrink-0 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200"
                >
                  <Image
                    src={url}
                    alt={`img-${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FormDialog>
  );
}
