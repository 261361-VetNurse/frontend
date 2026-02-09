import { z } from 'zod';

export const PetSchema = z.object({
    _id: z.string(),
    user_id: z.string(),
    name: z.string(),
    species: z.string(),
    breed: z.string(),
    color: z.string().nullable(),
    gender: z.string(),
    birth_date: z.string(),
    weight_kg: z.number().nullable(),
    allergies: z.array(z.string()),
    infecund: z.boolean(),
    in_medical: z.boolean(),
    profile_image: z.string(),
    created_at: z.string(),
    updated_at: z.string().optional(),
});
