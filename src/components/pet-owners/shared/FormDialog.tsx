"use client";

import React from "react";
import { Modal } from "./Modal";
import Button from "./Button";

export type FormDialogProps = {
    open: boolean;
    onClose: () => void;

    title: string;
    subtitle?: string;
    illustration?: React.ReactNode;

    layout?: "singleColumn" | "twoColumn";
    density?: "compact" | "standard";

    dirty?: boolean;
    submitting?: boolean;

    primaryLabel: string;
    onPrimary: () => void;
    primaryActionStyle?: "primary" | "danger";

    secondaryLabel?: string;
    onSecondary?: () => void;
    secondaryActionStyle?: "secondary" | "outline" | "danger";

    children: React.ReactNode;
};

export function FormDialog({
    open,
    onClose,

    title,
    subtitle,
    illustration,

    layout = "singleColumn",
    density = "standard",

    dirty = false,
    submitting = false,

    primaryLabel,
    onPrimary,
    primaryActionStyle = "primary",

    secondaryLabel,
    onSecondary,
    secondaryActionStyle = "outline",

    children,
}: FormDialogProps) {
    const gap = density === "compact" ? "gap-4" : "gap-5";

    const contentCls =
        layout === "twoColumn" ? "grid grid-cols-2 gap-4" : `grid grid-cols-1 ${gap}`;

    return (
        <Modal
            open={open}
            onClose={onClose}
            placement="center"
            size="md"
            scroll="inside"
            radius="lg"
            overlay="dim"
            elevation="md"
            header="titleSubtitle"
            closeButton="on"
            footer="actionsSticky"
            dismissable={submitting ? "none" : "backdrop"}
            title={title}
            subtitle={subtitle}
            dirty={dirty}
            footerNode={
                <div className="flex items-center gap-3">
                    {secondaryLabel && onSecondary ? (
                        <Button
                            variant={secondaryActionStyle === "danger" ? "danger" : secondaryActionStyle === "secondary" ? "secondary" : "outline"}
                            shape="pill"
                            fullWidth
                            onClick={onSecondary}
                            disabled={submitting}

                        >
                            {secondaryLabel}
                        </Button>
                    ) : null}

                    <Button
                        variant={primaryActionStyle === "danger" ? "danger" : "primary"}
                        shape="pill"
                        fullWidth
                        onClick={onPrimary}
                        disabled={submitting}
                    >
                        {submitting ? "Loading..." : primaryLabel}
                    </Button>
                </div>
            }
        >
            {/* illustration */}
            {illustration ? (
                <div className="flex items-center gap-4 pb-2">
                    <div className="h-14 w-14 rounded-full bg-black/10 grid place-items-center overflow-hidden">
                        {illustration}
                    </div>
                </div>
            ) : null}

            <div className={contentCls}>{children}</div>
        </Modal>
    );
}
{/* <FormDialog
    open={open}
    onClose={() => setOpen(false)}
    title="Add New Medication"
    primaryLabel="Save"
    secondaryLabel="Cancel"
    onPrimary={() => alert("Submit")}
    onSecondary={() => setOpen(false)}
>
    {/* ---------- เนื้อหาที่ยาวเพื่อทดสอบ scroll ---------- */}
//     <div className="space-y-4">
//         {Array.from({ length: 2 }).map((_, i) => (
//             <div key={i} className="space-y-1">
//                 <label className="text-sm font-medium">Field {i + 1}</label>
//                 <input
//                     className="w-full h-10 rounded border px-3"
//                     placeholder={`Input ${i + 1}`}
//                 />
//             </div>
//         ))}
//     </div>
// </FormDialog> */}