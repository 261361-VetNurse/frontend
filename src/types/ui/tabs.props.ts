// UI Component Props - Tabs

export type TabItem = {
    label: string;
    value: string;
    icon?: React.ReactNode;
    badge?: string | number;
};

export type AppointmentTabKey = "upcoming" | "completed" | "canceled";
