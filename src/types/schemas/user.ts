import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    display_name: z.string(),
    picture_url: z.string(),
    role: z.string(),
    is_registered: z.boolean(),
});

export const UserProfileSchema = z.object({
    id: z.string(),
    fname: z.string(),
    lname: z.string(),
    line_id: z.string(),
    picture_url: z.string().optional().or(z.literal("")),
    contact: z.object({
        gender: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
    }).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});
