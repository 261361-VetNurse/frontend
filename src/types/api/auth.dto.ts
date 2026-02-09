// API DTO Types for Authentication

export interface LineExchangeResponse {
    access_token: string;
    token_type: string;
    is_new_user: boolean;
    user: {
        id: string;
        display_name: string;
        picture_url: string;
        line_id: string;
    };
}

export interface UserResponse {
    id: string;
    display_name: string;
    picture_url: string;
    role: string;
    is_registered: boolean;
}

export interface RegisterOwnerDTO {
    // Owner registration payload
    [key: string]: any;
}

export interface RegisterPetDTO {
    // Pet registration payload
    [key: string]: any;
}
