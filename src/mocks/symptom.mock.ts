import { SymptomRecord } from "@/types/domain/symptom";
import { mockPets } from "./pets.mock";

// Helper to generate dates relative to today
const getDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
};

const getISO = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
};

const p1 = mockPets[0]?._id || "pet_001";
const p2 = mockPets[1]?._id || "pet_002";
const p3 = "pet_003"; // Optional 3rd pet

export const mockSymptomRecords: SymptomRecord[] = [
    // --- TODAY ---
    {
        _id: "sym_001",
        pet_id: p1,
        symptom: "Vomiting",
        severity: "Moderate",
        note: "Vomited after eating breakfast.",
        date: getDate(0) + "T08:30:00.000Z",
        images: [],
        created_at: getISO(0),
        updated_at: getISO(0)
    },
    {
        _id: "sym_002",
        pet_id: p2,
        symptom: "Coughing",
        severity: "Severe",
        note: "Dry cough, seems painful.",
        date: getDate(0) + "T14:15:00.000Z",
        images: [],
        created_at: getISO(0),
        updated_at: getISO(0)
    },

    // --- YESTERDAY ---
    {
        _id: "sym_003",
        pet_id: p1,
        symptom: "Lethargy",
        severity: "Mild",
        note: "Sleeping more than usual.",
        date: getDate(1) + "T09:00:00.000Z",
        images: [],
        created_at: getISO(1),
        updated_at: getISO(1)
    },

    // --- PAST WEEK ---
    {
        _id: "sym_004",
        pet_id: p1,
        symptom: "Diarrhea",
        severity: "Moderate",
        note: "Loose stool twice today.",
        date: getDate(3) + "T18:45:00.000Z",
        images: [],
        created_at: getISO(3),
        updated_at: getISO(3)
    },
    {
        _id: "sym_005",
        pet_id: p2,
        symptom: "Itching",
        severity: "Mild",
        note: "Scratching ear excessively.",
        date: getDate(4) + "T11:20:00.000Z",
        images: [],
        created_at: getISO(4),
        updated_at: getISO(4)
    },
    {
        _id: "sym_006",
        pet_id: p1,
        symptom: "Sneezing",
        severity: "Mild",
        note: "Sneezed multiple times in a row.",
        date: getDate(6) + "T07:10:00.000Z",
        images: [],
        created_at: getISO(6),
        updated_at: getISO(6)
    },

    // --- TWO WEEKS AGO ---
    {
        _id: "sym_007",
        pet_id: p2,
        symptom: "Limping",
        severity: "Moderate",
        note: "Limps on front left leg.",
        date: getDate(12) + "T16:00:00.000Z",
        images: ["/pets-example/pet-ex1.svg"],
        created_at: getISO(12),
        updated_at: getISO(12)
    },
    {
        _id: "sym_008",
        pet_id: p1,
        symptom: "Eye Discharge",
        severity: "Mild",
        note: "Greenish discharge from right eye.",
        date: getDate(14) + "T10:30:00.000Z",
        images: [],
        created_at: getISO(14),
        updated_at: getISO(14)
    },

    // --- LAST MONTH (approx 30 days ago) ---
    {
        _id: "sym_009",
        pet_id: p1,
        symptom: "Loss of Appetite",
        severity: "Severe",
        note: "Refused to eat dinner.",
        date: getDate(30) + "T19:00:00.000Z",
        images: [],
        created_at: getISO(30),
        updated_at: getISO(30)
    },
    {
        _id: "sym_010",
        pet_id: p2,
        symptom: "Vomiting",
        severity: "Moderate",
        note: "Vomited yellow liquid.",
        date: getDate(32) + "T06:45:00.000Z",
        images: [],
        created_at: getISO(32),
        updated_at: getISO(32)
    },

    // --- TWO MONTHS AGO (approx 60 days ago) ---
    {
        _id: "sym_011",
        pet_id: p1,
        symptom: "Skin Rash",
        severity: "Moderate",
        note: "Red rash on belly.",
        date: getDate(60) + "T13:15:00.000Z",
        images: [],
        created_at: getISO(60),
        updated_at: getISO(60)
    },
    {
        _id: "sym_012",
        pet_id: p1,
        symptom: "Fever",
        severity: "Severe",
        note: "Felt very hot to touch, lethargic.",
        date: getDate(61) + "T20:00:00.000Z",
        images: [],
        created_at: getISO(61),
        updated_at: getISO(61)
    },

    // --- THREE MONTHS AGO (approx 90 days ago) ---
    {
        _id: "sym_013",
        pet_id: p2,
        symptom: "Ear Infection",
        severity: "Moderate",
        note: "Bad smell from ear.",
        date: getDate(90) + "T09:30:00.000Z",
        images: [],
        created_at: getISO(90),
        updated_at: getISO(90)
    },

    // --- RANDOM SCATTER ---
    {
        _id: "sym_014",
        pet_id: p1,
        symptom: "Coughing",
        severity: "Mild",
        note: "Occasional cough.",
        date: getDate(45) + "T15:20:00.000Z",
        images: [],
        created_at: getISO(45),
        updated_at: getISO(45)
    },
    {
        _id: "sym_015",
        pet_id: p2,
        symptom: "Lethargy",
        severity: "Mild",
        note: "Just tired after park.",
        date: getDate(22) + "T19:40:00.000Z",
        images: [],
        created_at: getISO(22),
        updated_at: getISO(22)
    },
    {
        _id: "sym_016",
        pet_id: p1,
        symptom: "Scratching",
        severity: "Mild",
        note: "Scratching neck.",
        date: getDate(100) + "T08:10:00.000Z",
        images: [],
        created_at: getISO(100),
        updated_at: getISO(100)
    }
];
