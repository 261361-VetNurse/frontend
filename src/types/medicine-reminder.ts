export type MedicineReminderVM = {
    notification_id: string;

    pet: {
        id: string;
        name: string;
        image_url: string;
    };

    medicine: {
        id: string;
        name: string;
        dosage: string;
    };

    schedule: {
        date: string; // YYYY-MM-DD
        time: string; // HH:mm
        datetime: string; // ISO
    };

    is_read: boolean;
};
