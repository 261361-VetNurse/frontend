"use client";

export type AppointmentTabKey = "upcoming" | "completed" | "canceled";

export default function AppointmentTabs({
  value,
  onChange,
}: {
  value: AppointmentTabKey;
  onChange: (v: AppointmentTabKey) => void;
}) {
  return (
    <div className="w-full">
      <div className="flex w-full rounded-full bg-zinc-100 p-1">
        <TabBtn active={value === "upcoming"} onClick={() => onChange("upcoming")}>
          Upcoming
        </TabBtn>
        <TabBtn active={value === "completed"} onClick={() => onChange("completed")}>
          Completed
        </TabBtn>
        <TabBtn active={value === "canceled"} onClick={() => onChange("canceled")}>
          Canceled
        </TabBtn>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-full py-2 text-sm font-medium text-center transition",
        active ? "bg-sky-500 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
