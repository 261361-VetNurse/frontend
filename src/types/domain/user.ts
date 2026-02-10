export interface User {
    id?: string;
    display_name?: string;
    picture_url?: string | null;
    role?: string;
    is_registered?: boolean;
}

export interface UserProfile {
    user_id: string;
    line_id: string;
    display_name?: string | null;
    profile_image?: string | null;
    fname: string;
    lname: string;
    phone?: string | null;
    email?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    subdistrict?: string | null;
    district?: string | null;
    province?: string | null;
    postal_code?: string | null;
    country?: string | null;
    is_registered?: boolean;
    pets?: {
        pet_id: number;
        name: string;
        species: string;
        breed?: string | null;
        profile_image?: string | null;
    }[];
}
