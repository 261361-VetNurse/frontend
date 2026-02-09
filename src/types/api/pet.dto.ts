// API DTO Types for Pet operations

export interface CreatePetDTO {
    name: string;
    species: string;
    breed: string;
    color?: string;
    gender: string;
    birth_date: string;
    weight_kg?: string;
    allergies?: string[];
    infecund: boolean;
    profile_image?: string;
}

export interface UpdatePetDTO {
    name?: string;
    species?: string;
    breed?: string;
    color?: string;
    gender?: string;
    birth_date?: string;
    weight_kg?: string;
    allergies?: string[];
    infecund?: boolean;
    profile_image?: string;
}
