export type MedicineReminderVM = {
    notification_id: string;

    pet: {
        id: string;
        name: string;
        image_url: string;
    };

    medicine: {
        id: string;
        dosage: string;   
    };

    schedule: {
        frequency: {
            key: "everyday" | "interval_hours" | "custom";
            label: string; 
            interval_hours?: number; 
            days_of_week?: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">; // ถ้าเป็น custom
        };

        reminders: Array<{
            id: string;       
            time: string;  
            is_taken: boolean;
            taken_at?: string; 
        }>;

        measurement_times_per_day: number; // Measurement: "2 times"
        starting_date: string;          
    };

    medication_status: {
        is_stopped: boolean;  // สถานะหยุดยาแทน finish
        stopped_at?: string;  // ISO
        reason?: string;      // optional
    };
};
