"use client";

import React from "react";

export default function RecordDateSection({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const showHeader = Boolean(label && label.trim().length > 0);

  return (
    <section>
      {showHeader && (
        <>
          <div className="text-sm font-semibold text-zinc-900">{label}</div>
          <div className="mt-2 border-b border-zinc-200" />
        </>
      )}

      <div className={showHeader ? "mt-3 space-y-3" : "space-y-3"}>{children}</div>
    </section>
  );
}
