import type { PetInformation } from "@/types/Pet";

export const mockPetInformationById: Record<string, PetInformation> = {
  "4302459": {
    header: {
      id: "4302459",
      pid: "4302459",
      name: "Lee",
      avatarUrl: "/pets-example/pet-ex1.svg",
      verified: true,
    },
    basicInfo: {
      name: "Lee",
      species: "Cat",
      breed: "British Shorthair",
      dateOfBirth: "2024-01-01",
      ageText: "1 years",
      sex: "Male",
      color: "White",
      previousClinicOrHospital: "Happy Paws Animal Clinic",
    },
  },

  "430587": {
    header: {
      id: "430587",
      pid: "430587",
      name: "Tom",
      avatarUrl: "/pets-example/pet-ex2.svg",
      verified: false,
    },
    basicInfo: {
      name: "Tom",
      species: "Dog",
      breed: "Poodle",
      dateOfBirth: "2023-01-01",
      ageText: "2 years",
      sex: "Male",
      color: "White",
      previousClinicOrHospital: "-",
    },
  },
};
