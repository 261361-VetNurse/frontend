export type Pet = {
  pet_id: number;
  user_id?: number;
  name: string;
  species?: string | null;
  breed?: string | null;
  birth_date?: string | null;
  weight_kg?: number | null;
  color?: string | null;
  gender?: string | null;
  allergies?: string[] | string | null;
  in_medical?: boolean | null;
  infecund?: boolean | null;
  profile_image?: string | null;
  is_verified?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PetId = Pet['pet_id'];

export type PetLite = {
  pet_id: number;
  name: string;
  profile_image?: string | null;
};
