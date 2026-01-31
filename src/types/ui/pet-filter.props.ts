// UI Component Props - Pet Filter

export type PetSelectorValue = string | "all";

export type RecordItem = {
    id: string;
    pets_id: string;
    symptom_date: string;
    symptoms: string[];
    description?: string;
    images?: string[];
    created_at: string;
    updated_at: string;
};

export type RecordDetailItem = {
    label: string;
    value: string | React.ReactNode;
    icon?: React.ReactNode;
};
