export interface User {
    id?: string;
    display_name?: string;
    picture_url?: string | null;
    role?: string;
    is_registered?: boolean;
}

export interface UserProfile {
    user_id: string;
    fname: string;
    lname: string;
    line_id: string;
    profile_image?: string | null;
}
