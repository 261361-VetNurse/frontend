import { MedicalRecord } from "@/types/domain/medical";
import { mockPets } from "@/mocks/pets.mock";

const mochi = mockPets.find(p => p.name === "Mochi") || mockPets[0];
const taro = mockPets.find(p => p.name === "Taro") || mockPets[1];
const kiwi = mockPets.find(p => p.name === "Kiwi") || mockPets[3];

export const mockMedicalRecords: MedicalRecord[] = [
    {
        _id: "med_rec_001",
        pet_id: mochi._id,
        note: "Annual vaccination and checkup. Everything looks good.",
        images: ["/medical/vaccine_cert_2025.jpg"],
        created_at: "2025-05-10T10:00:00.000Z",
        updated_at: "2025-05-10T10:00:00.000Z",
    },
    {
        _id: "med_rec_002",
        pet_id: taro._id,
        note: "Skin irritation treatment. Prescribed topical cream.",
        images: [],
        created_at: "2025-11-20T14:30:00.000Z",
        updated_at: "2025-11-20T14:30:00.000Z",
    },
    {
        _id: "med_rec_003",
        pet_id: kiwi._id,
        note: "Initial health check for new bird. Beak is slightly overgrown.",
        images: ["/medical/kiwi_initial_check.jpg"],
        created_at: "2026-01-10T09:30:00.000Z",
        updated_at: "2026-01-10T09:30:00.000Z",
    }
];
