"use client";

import clsx from "clsx";
import { ComponentPropsWithoutRef, ElementType } from "react";

type Props<T extends ElementType> = {
  as?: T;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pillColor?: string;
} & ComponentPropsWithoutRef<T>;

export function Card<T extends ElementType = "button">({
  as,
  headerRight,
  children,
  className,
  pillColor,
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
    > <div className="px-4 pt-3 w-full">
        {/* Header — EXACT SAME AS RECORD */}
        {headerRight && (
          <div>
            <div className="text-right text-xs text-zinc-500">
              {headerRight}
            </div>
            <div className="mt-2 h-px w-full bg-zinc-200" />
          </div>
        )}

        <div className="flex items-center py-3 gap-3 w-full">
          {/* Colored pill bar */}
          {pillColor && <div className={`w-1 self-stretch rounded-full ${pillColor} shrink-0 min-h-[40px]`} />}

          {/* Body — SAME PADDING RHYTHM */}
          <div className="py-1 w-full">
            {children}
          </div>
        </div>
      </div>
    </Component>
  );
}
