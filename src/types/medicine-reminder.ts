export type MedicineReminderVM = {
    notification_id: string;

    pet: {
        id: string;
        name: string;
        image_url: string;
    };

    medicine: {
        id: string;
        name: string;      // Medicine Name
        dosage: string;    // เช่น "150mg" หรือ "1 capsule"
    };

    schedule: {
        frequency: {
            key: "everyday" | "interval_hours" | "custom";
            label: string; // เช่น "Everyday"
            interval_hours?: number; // ถ้าเป็น interval_hours
            days_of_week?: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">; // ถ้าเป็น custom
        };

        reminders: Array<{
            id: string;
            time: string; // HH:mm
        }>;

        measurement_times_per_day: number; // Measurement: "2 times"
        starting_date: string;            // YYYY-MM-DD (Starting)
    };

    medication_status: {
        is_stopped: boolean;  // สถานะหยุดยาแทน finish
        stopped_at?: string;  // ISO
        reason?: string;      // optional
    };
};
