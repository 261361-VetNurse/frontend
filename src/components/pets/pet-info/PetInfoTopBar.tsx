"use client";

export default function PetInfoTopBar({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="px-4 pt-4 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-zinc-700"
      >
        <span className="text-xl leading-none">‹</span>
        Back
      </button>

      <div className="text-base font-semibold text-zinc-900">{title}</div>

      <button
        type="button"
        onClick={onClose}
        className="text-xl text-zinc-500"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
