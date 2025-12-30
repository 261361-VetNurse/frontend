"use client";

type NewPetButtonProps = {
  onClick?: () => void;
};

export default function NewPet({ onClick }: NewPetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[96px] shrink-0 flex flex-col items-center gap-2"
    >
      <div className="h-16 w-16 rounded-full bg-sky-500 flex items-center justify-center shadow-sm active:scale-95 transition">
        <span className="text-white text-4xl leading-none">+</span>
      </div>
      <div className="text-xs text-zinc-600">New Pet</div>
    </button>
  );
}
