import RegisterNewPetPage from "@/components/pet-owners/MainPage/MyPetsPage/new/RegisterNewPetPage";
import { Suspense } from "react";

export default function Page() {
    return <Suspense fallback={<div>Loading...</div>}>
        <RegisterNewPetPage />
    </Suspense>;
}
