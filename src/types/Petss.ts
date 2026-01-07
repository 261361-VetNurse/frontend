export type Gender = "Male" | "Female";

export type Petss = {
  id: string;           
  pid?: string;          
  name: string;
  gender: Gender;
  birthDate: string;     
  verified: boolean;
  inMedical: boolean;
  imageUrl?: string;

  species?: string;
  breed?: string;
  color?: string;
  previousClinicOrHospital?: string;
};


export type PetCardModel =
  Pick<Petss, "id" | "pid" | "name" | "gender" | "verified" | "imageUrl"> & {
    ageText: string;    
  };


export type PetHeader = {
  id: string;           
  name: string;
  pid: string;
  avatarUrl?: string;
  verified: boolean;
};

export type BasicInfo = {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;  
  ageText: string;      
  sex: Gender;
  color: string;
  previousClinicOrHospital: string;
};

export type PetInformation = {
  header: PetHeader;
  basicInfo: BasicInfo;
};