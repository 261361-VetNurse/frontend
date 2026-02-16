// API DTO Types for Authentication

export interface LineExchangeResponse {
    access_token: string;
    token_type: string;
    is_new_user: boolean;
    user: {
        id: number;
        display_name: string;
        picture_url: string | null;
        line_id: string;
    };
}

export interface UserResponse {
    id: number;
    display_name: string;
    picture_url: string | null;
    role: string;
    is_registered: boolean;
}

export interface RegisterOwnerPayload {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address_line1: string;
    address_line2?: string | null;
    subdistrict: string;
    district: string;
    province: string;
    postal_code: string;
}

export interface RegisterPetPayload {
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

export interface UserProfileUpdatePayload {
    display_name?: string;
    picture_url?: string;
    fname?: string;
    lname?: string;
    gender?: string;
    line_id?: string;
    phone?: string;
    email?: string;
    address?: string;
}
