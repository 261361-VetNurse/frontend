export interface User {
    id: string;
    display_name: string;
    picture_url: string;
    role: string;
    is_registered: boolean;
}

export interface Address {
    address_line1?: string;
    address_line2?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    postal_code?: string;
    country?: string;
}

export interface UserContact {
    phone?: string;
    line_id?: string;
    email?: string;
    gender?: string; // Kept as per request
}

export interface UserProfile {
    id: string; // Maps to _id in API response usually, keeping id for frontend consistency
    fname: string;
    lname: string;
    contact?: UserContact;
    address?: Address;
    picture_url?: string; // Kept as per request
    created_at?: string;
    updated_at?: string;
}
