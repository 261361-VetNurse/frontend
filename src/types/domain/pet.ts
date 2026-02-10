export type Pet = {
  pet_id: string;
  name: string;
  species?: string | null;
  breed?: string | null;
  birth_date?: string | null;
  weight_kg?: number | null;
  color?: string | null;
  gender?: string | null;
  in_medical?: boolean | null;
  infecund?: boolean | null;
  profile_image?: string | null;
};

export type PetId = Pet['pet_id'];

export type PetLite = {
  pet_id: string;
  name: string;
  profile_image?: string | null;
};
