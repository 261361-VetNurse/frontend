export type Pet = {
  _id: string;    // เลข 6 หลัก
  user_id: string;
  name: string;
  species: string;
  breed: string;
  color: string | null;
  gender: string;
  birth_date: string;
  weight_kg: string | null;
  allergies: string[];
  infecund: boolean;
  profile_image: string;
  created_at: string;
};

export type PetId = Pet['_id'];
