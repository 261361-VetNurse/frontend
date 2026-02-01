"use client";

import clsx from "clsx";
import { ComponentPropsWithoutRef, ElementType } from "react";

type Props<T extends ElementType> = {
  as?: T;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<T>;

export function Card<T extends ElementType = "button">({
  as,
  headerRight,
  children,
  className,
  ...props
}: Props<T>) {
  const Component = as || "button";

  return (
    <Component
      {...props}
      className={clsx(
        "w-full text-left rounded-2xl bg-white",
        "border border-zinc-100 shadow-sm",
        "hover:bg-zinc-50 active:scale-[0.99] transition",
        className
      )}
    >
      {/* Header — EXACT SAME AS RECORD */}
      {headerRight && (
        <div className="px-4 pt-3">
          <div className="text-right text-xs text-zinc-500">
            {headerRight}
          </div>
          <div className="mt-2 h-px w-full bg-zinc-200" />
        </div>
      )}

      {/* Body — SAME PADDING RHYTHM */}
      <div className="px-4 pb-4 pt-3">
        {children}
      </div>
    </Component>
  );
}
