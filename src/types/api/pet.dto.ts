// API DTO Types for Pet operations

export interface PetItem {
    pet_id: number;
    name: string;
    species: string;
    breed: string | null;
    birth_date: string | null;
    weight_kg: number | null; // Backend uses float
    color: string | null;
    gender: string | null;
    in_medical: boolean | null;
    infecund: boolean | null;
    profile_image: string | null;
}

export interface CreatePetDTO {
    name: string;
    species: string;
    breed?: string | null;
    gender: string;
    birth_date: string;
    color?: string | null;
    weight_kg?: number;
    infecund?: boolean;
    in_medical?: boolean;
    profile_image?: string | null;
    previous_clinic?: string | null;
    has_medical_history?: boolean;
}

export interface UpdatePetDTO {
    name?: string | null;
    species?: string | null;
    breed?: string | null;
    gender?: string | null;
    birth_date?: string | null;
    weight_kg?: number | null;
    color?: string | null;
    infecund?: boolean | null;
    in_medical?: boolean | null;
    profile_image?: string | null;
    allergies?: string[] | null;
}
