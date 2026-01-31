// UI Component Props - Calendar

export type CalendarSize = "compact" | "standard";
export type WeekStart = "sun" | "mon";
export type MarkerColorKey = "appointment" | "medication" | "record";

export type DayMarker = {
    date: string;
    type: MarkerColorKey;
};

export type CalendarDayMeta = {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    markers: MarkerColorKey[];
};

export type CalendarProps = {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    markers?: DayMarker[];
    size?: CalendarSize;
    weekStart?: WeekStart;
    minDate?: Date;
    maxDate?: Date;
};
