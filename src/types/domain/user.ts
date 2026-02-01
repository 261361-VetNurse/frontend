export interface User {
    id: string;
    display_name: string;
    picture_url: string;
    role: string;
    is_registered: boolean;
}

export interface UserContact {
    gender?: string;
    phone?: string;
    email?: string;
}

export interface UserProfile {
    id: string;
    fname: string;
    lname: string;
    line_id: string;
    picture_url?: string;
    contact?: UserContact;
    created_at?: string;
    updated_at?: string;
}
