import type { Pet } from "@/types/Pet";

export const mockPets: Pet[] = [
  {
    id: "4302459",
    pid: "4302459",
    name: "Lee",
    gender: "Male",
    birthDate: "2024-01-01",
    verified: true,
    inMedical: true,
    imageUrl: "/pets-example/pet-ex1.svg",

    species: "Cat",
    breed: "British Shorthair",
    color: "White",
    previousClinicOrHospital: "Happy Paws Animal Clinic",
  },
  {
    id: "430587",
    pid: "430587",
    name: "Tom",
    gender: "Male",
    birthDate: "2023-01-01",
    verified: false,
    inMedical: false,
    imageUrl: "/pets-example/pet-ex2.svg",

    species: "Dog",
    breed: "Poodle",
    color: "White",
    previousClinicOrHospital: "-",
  },
];
