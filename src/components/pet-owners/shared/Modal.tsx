"use client";

import React from "react";
import Button from "./Button";
import { Close } from "@mui/icons-material";

type ModalProps = {
    open: boolean;
    onClose: () => void;

    size?: "sm" | "md" | "lg";
    placement?: "center" | "bottom";
    scroll?: "inside" | "body";
    radius?: "md" | "lg";
    header?: "titleOnly" | "titleWithClose" | "titleSubtitle";
    footer?: "none" | "actionsSticky";
    closeButton?: "on" | "off";
    dismissable?: "backdrop" | "escape" | "none";
    overlay?: "dim" | "blur";
    elevation?: "none" | "sm" | "md";

    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footerNode?: React.ReactNode;

    dirty?: boolean;
    confirmOnDirty?: (msg?: string) => boolean;
};

const sizeCls: Record<NonNullable<ModalProps["size"]>, string> = {
    sm: "sm:max-w-[360px]",
    md: "sm:max-w-[420px]",
    lg: "sm:max-w-[520px]",
};

const radiusCls: Record<NonNullable<ModalProps["radius"]>, string> = {
    md: "rounded-2xl",
    lg: "rounded-[8px]",
};

const elevationCls: Record<NonNullable<ModalProps["elevation"]>, string> = {
    none: "shadow-none",
    sm: "shadow-[0_8px_20px_rgba(0,0,0,0.2)]",
    md: "shadow-[0_10px_28px_rgba(0,0,0,0.18)]",
};

export function Modal({
    open,
    onClose,

    size = "md",
    placement = "center",
    scroll = "inside",
    radius = "lg",
    header = "titleWithClose",
    footer = "actionsSticky",
    closeButton = "on",
    dismissable = "backdrop",
    overlay = "dim",
    elevation = "md",

    title,
    subtitle,
    children,
    footerNode,

    dirty = false,
    confirmOnDirty = (msg) => window.confirm(msg ?? "Discard changes?"),
}: ModalProps) {
    const titleId = React.useId();
    const descId = React.useId();

    const tryClose = React.useCallback(() => {
        if (dirty) {
            const ok = confirmOnDirty("Discard changes?");
            if (!ok) return;
        }
        onClose();
    }, [dirty, confirmOnDirty, onClose]);

    // Esc
    React.useEffect(() => {
        if (!open) return;
        if (dismissable === "none") return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (dismissable === "escape" || dismissable === "backdrop") {
                e.preventDefault();
                tryClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, dismissable, tryClose]);

    // lock body scroll
    React.useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = original;
        };
    }, [open]);

    if (!open) return null;

    const overlayCls =
        overlay === "blur" ? "bg-black/25 backdrop-blur-[2px]" : "bg-black/25";

    const placementCls = placement === "bottom" ? "items-end" : "items-center";

    // ✅ overlay padding: px 24, py clamp(16..72)
    const overlayPadY = "clamp(16px, 6vh, 72px)";

    // ✅ card padding unified: px16 py8
    const PAD = "px-4 pt-2 pb-4"; // 16px / 8px

    // ✅ max height ของ card แบบชัวร์ ไม่พึ่ง tailwind calc+clamp
    const cardMaxHeight =
        scroll === "inside" ? `calc(100vh - (${overlayPadY} * 2))` : undefined;

    return (
        <div
            className={[
                "fixed inset-0 z-[2000] flex justify-center",
                placementCls,
                "px-6", // 24px
                overlayCls,
            ].join(" ")}
            style={{ paddingTop: overlayPadY, paddingBottom: overlayPadY }}
            onMouseDown={(e) => {
                if (dismissable !== "backdrop") return;
                if (e.target === e.currentTarget) tryClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={subtitle ? descId : undefined}
        >
            <div
                className={[
                    "w-full min-w-0",
                    "flex flex-col min-h-0",
                    sizeCls[size],
                    "bg-white",
                    radiusCls[radius],
                    elevationCls[elevation],
                    "border border-black/10",
                    "overflow-hidden",
                ].join(" ")}
                style={{ maxHeight: cardMaxHeight }}
            >
                {/* Header */}
                {(header !== "titleOnly" || title) && (
                    <div className={`flex-shrink-0 bg-white ${PAD}`}>
                        <div className="flex items-center">
                            {/* Left spacer: ทำให้ title อยู่กลางเป๊ะ (เท่ากับปุ่มปิด) */}
                            <div className="w-8 shrink-0" />

                            {/* Center title: 21 hug */}
                            <div className="min-w-0 flex-1 flex items-center justify-center text-center">
                                {title ? (
                                    <div
                                        id={titleId}
                                        className="text-sm font-semibold text-[18px] leading-[21px] truncate"
                                    >
                                        {title}
                                    </div>
                                ) : null}
                            </div>

                            {/* Close */}
                            <div className="w-8 shrink-0 flex justify-end">
                                {closeButton === "on" ? (
                                    <Button
                                        variant="ghost"
                                        icon="only"
                                        onClick={tryClose}
                                    >
                                        <Close className="h-4 w-4" />
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}



                {/* Content */}
                <div
                    className={[
                        PAD,
                        "flex-1 min-h-0", // ✅ สำคัญมาก (min-h-0 กัน flex overflow)
                        scroll === "inside"
                            ? "overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
                            : "overflow-visible",
                    ].join(" ")}
                >
                    {children}
                </div>

                {/* Footer */}
                {footerNode && (
                    <div className={`flex-shrink-0 border-t bg-white ${PAD}`}>
                        {footerNode}
                    </div>
                )}
            </div>
        </div>
    );
}
