// export type MedicineReminderVM = {
//     notification_id: string;

//     pet: {
//         id: string;
//         name: string;
//         image_url: string;
//     };

//     medicine: {
//         id: string;
//         dosage: string;   
//     };

//     schedule: {
//         frequency: {
//             key: "everyday" | "interval_hours" | "custom";
//             label: string; 
//             interval_hours?: number; 
//             days_of_week?: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">; // ถ้าเป็น custom
//         };

//         reminders: Array<{
//             id: string;       
//             time: string;  
//             is_taken: boolean;
//             taken_at?: string; 
//         }>;

//         measurement_times_per_day: number; // Measurement: "2 times"
//         starting_date: string;          
//     };

//     medication_status: {
//         is_stopped: boolean;  // สถานะหยุดยาแทน finish
//         stopped_at?: string;  // ISO
//         reason?: string;      // optional
//     };
// };


// src/types/medicine-reminder.ts

export type Frequency =
    | { key: "everyday"; label: string }
    | { key: "interval_hours"; label: string; interval_hours: number }
    | { key: "custom"; label: string; days_of_week: string[] };

export type MedicineReminderVM = {
    notification_id: string;

    pet: {
        _id: string;            // ✅ แก้จาก id เป็น _id
        name: string;
        profile_image?: string; // ✅ แก้จาก image_url เป็น profile_image (ใส่ ? เผื่อไม่มีรูป)
    };

    medicine: {
        _id: string;            // ✅ แก้จาก id เป็น _id
        name: string;           // ✅ เพิ่ม field นี้ (ใน Mock มีแต่ Type เก่าไม่มี)
        dosage: string;
    };

    schedule: {
        frequency: {
            key: "everyday" | "interval_hours" | "custom";
            label: string;
            interval_hours?: number;
            days_of_week?: string[]; // ✅ แก้ให้รับ string[] ตาม mock
        };

        reminders: Array<{
            id: string;
            time: string;
            is_taken: boolean;
            status: string;
            taken_at?: string;
        }>;

        measurement_times_per_day: number;
        starting_date: string;
    };

    medication_status: {
        is_stopped: boolean;
        stopped_at?: string;
        reason?: string;
    };
};