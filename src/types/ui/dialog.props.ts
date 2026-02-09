// UI Component Props - Dialog/Modal

export type FormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    onSubmit?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
};
