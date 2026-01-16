import LoginPage from "@/components/pet-owners/MainPage/LoginPage";
import { Suspense } from "react";

export default function PetOwnersHomePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
        </Suspense>
    );
}
