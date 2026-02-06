
import { EachDayMedicine, Medicine } from "@/types/domain/medication";
import { MOCK_USER_ID } from "./owner.mock";
import { mockPets } from "./pets.mock";

// Helper to get pet IDs safely
const mochiId = mockPets.find(p => p.name === "Mochi")?._id || "430242";
const taroId = mockPets.find(p => p.name === "Taro")?._id || "430243";
const kiwiId = mockPets.find(p => p.name === "Kiwi")?._id || "430245";

export const mockMedicines: Medicine[] = [
    {
        _id: "med_001",
        user_id: MOCK_USER_ID,
        pet_id: mochiId,
        name: "Amoxicillin",
        notes: ["Take with food", "Shake well before use"],
        properties: "Antibiotic",
        image_urls: [],
        dosage: "5ml",
        frequency: "-1", // Daily
        status: "TAKE",
        reminder_time: ["08:00", "20:00"],
        start_date: "2026-02-01T00:00:00.000Z",
        end_date: "2026-02-14T00:00:00.000Z",
        created_at: "2026-01-30T10:00:00.000Z",
        updated_at: "2026-01-30T10:00:00.000Z",
    },
    {
        _id: "med_002",
        user_id: MOCK_USER_ID,
        pet_id: mochiId,
        name: "Vitamin Chews",
        notes: ["Give as a treat"],
        properties: "Supplement",
        image_urls: [],
        dosage: "1 chew",
        frequency: "1", // Tuesday ? (Schema says 0=Mon, so 1=Tue) - Assuming 0-6 enum based on type def
        status: "TAKE",
        reminder_time: ["09:00"],
        start_date: "2026-01-01T00:00:00.000Z",
        end_date: "2026-12-31T00:00:00.000Z",
        created_at: "2025-12-25T09:00:00.000Z",
        updated_at: "2025-12-25T09:00:00.000Z",
    },
    {
        _id: "med_003",
        user_id: MOCK_USER_ID,
        pet_id: taroId,
        name: "Flea Prevention",
        notes: ["Apply to back of neck"],
        properties: "Topical",
        image_urls: [],
        dosage: "1 vial",
        frequency: "5", // Saturday
        status: "TAKE",
        reminder_time: ["10:00"],
        start_date: "2026-02-15T00:00:00.000Z",
        end_date: "2026-08-15T00:00:00.000Z",
        created_at: "2026-02-01T14:20:00.000Z",
        updated_at: "2026-02-01T14:20:00.000Z",
    },
    {
        _id: "med_004",
        user_id: MOCK_USER_ID,
        pet_id: taroId,
        name: "Heartworm Meds",
        notes: [],
        properties: "Oral Tablet",
        image_urls: [],
        dosage: "1 tablet",
        frequency: "-1", // Daily
        status: "STOP",
        reminder_time: ["18:00"],
        start_date: "2025-06-01T00:00:00.000Z",
        end_date: "2025-12-01T00:00:00.000Z",
        created_at: "2025-05-20T11:00:00.000Z",
        updated_at: "2025-12-02T09:00:00.000Z",
    },
    {
        _id: "med_005",
        user_id: MOCK_USER_ID,
        pet_id: kiwiId,
        name: "Bird Vitamin",
        notes: ["Mix with water"],
        properties: "Liquid",
        image_urls: [],
        dosage: "5 drops",
        frequency: "-1", // Daily
        status: "TAKE",
        reminder_time: ["07:00"],
        start_date: "2026-01-15T00:00:00.000Z",
        end_date: "2026-03-15T00:00:00.000Z",
        created_at: "2026-01-14T10:00:00.000Z",
        updated_at: "2026-01-14T10:00:00.000Z",
    },
];

export const mockEachDayMedicines: EachDayMedicine[] = [
    {
        _id: "noti_001",
        user_id: MOCK_USER_ID,
        pet_id: mochiId,
        medicine_id: "med_001",
        medicine_name: "Amoxicillin",
        medicine_dosage: "5ml",
        medicine_frequency: "-1", // Daily
        pet_name: "Mochi",
        pet_image: "",
        reminder_time: ["08:00", "20:00"],
        created_at: "2026-01-30T10:00:00.000Z",
        updated_at: "2026-01-30T10:00:00.000Z",
    },
    {
        _id: "noti_003",
        user_id: MOCK_USER_ID,
        pet_id: mochiId,
        medicine_id: "med_002",
        medicine_name: "Vitamin Chews",
        medicine_dosage: "1 chew",
        medicine_frequency: "1", // Tuesday ? (Schema says 0=Mon, so 1=Tue) - Assuming 0-6 enum based on type def
        pet_name: "Mochi",
        pet_image: "",
        reminder_time: ["09:00"],
        created_at: "2025-12-25T09:00:00.000Z",
        updated_at: "2025-12-25T09:00:00.000Z",
    },
    {
        _id: "noti_002",
        user_id: MOCK_USER_ID,
        pet_id: taroId,
        medicine_id: "med_003",
        medicine_name: "Flea Prevention",
        medicine_dosage: "1 vial",
        medicine_frequency: "5", // Saturday
        pet_name: "Taro",
        pet_image: "",
        reminder_time: ["10:00"],
        status: "TAKE",
        created_at: "2026-02-01T14:20:00.000Z",
        updated_at: "2026-02-01T14:20:00.000Z",
    },
    {
        _id: "noti_005",
        user_id: MOCK_USER_ID,
        pet_id: taroId,
        medicine_id: "med_004",
        medicine_name: "Heartworm Meds",
        medicine_dosage: "1 tablet",
        medicine_frequency: "-1", // Daily
        pet_name: "Taro",
        pet_image: "",
        reminder_time: ["18:00"],
        created_at: "2025-05-20T11:00:00.000Z",
        updated_at: "2025-12-02T09:00:00.000Z",
    },
    {
        _id: "noti_004",
        user_id: MOCK_USER_ID,
        pet_id: kiwiId,
        medicine_id: "med_005",
        medicine_name: "Bird Vitamin",
        medicine_dosage: "5 drops",
        medicine_frequency: "-1", // Daily
        pet_name: "Kiwi",
        pet_image: "",
        reminder_time: ["07:00"],
        created_at: "2026-01-14T10:00:00.000Z",
        updated_at: "2026-01-14T10:00:00.000Z",
    },
];

