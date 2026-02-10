import PetInfo from "@/components/pet-owners/MainPage/MyPetsPage/pet-info/PetInfo";
import { Suspense } from "react";

export default function PetInfoPage() {
  return <Suspense fallback={<div>Loading...</div>}>
    <PetInfo />
  </Suspense>;
}
