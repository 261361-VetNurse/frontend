import { Pet } from "@/types/pet";

export const mockPets: Pet[] = [
    {
        _id: "65f1a9c2b0f3c1a2d3e4f601",
        user_id: "65f1a9c2b0f3c1a2d3e4f501",
        name: "Mochi",
        species: "cat",
        breed: "Scottish Fold",
        birth_date: "2023-05-10T00:00:00.000Z",
        sex: "female",
        image_url: "/pets-example/pet-ex1.svg",
        create_date: "2026-01-01T10:00:00.000Z",
    },
    {
        _id: "65f1a9c2b0f3c1a2d3e4f602",
        user_id: "65f1a9c2b0f3c1a2d3e4f501",
        name: "Taro",
        species: "dog",
        breed: "Shiba Inu",
        birth_date: "2022-11-21T00:00:00.000Z",
        sex: "male",
        image_url: "/pets-example/pet-ex2.svg",
        create_date: "2026-01-01T10:05:00.000Z",
    },
    {
        _id: "65f1a9c2b0f3c1a2d3e4f603",
        user_id: "65f1a9c2b0f3c1a2d3e4f502",
        name: "Luna",
        species: "cat",
        breed: "Domestic Shorthair",
        birth_date: "2024-02-14T00:00:00.000Z",
        sex: "female",
        image_url: "/pets-example/pet-ex3.svg",
        create_date: "2026-01-02T11:00:00.000Z",
    },
];
