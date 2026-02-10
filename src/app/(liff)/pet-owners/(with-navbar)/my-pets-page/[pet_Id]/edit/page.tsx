import EditBasicInfo from "@/components/pet-owners/MainPage/MyPetsPage/pet-info/EditBasicInfo";
import { Suspense } from "react";

export default function Page() {
  return <Suspense fallback={<div>Loading...</div>}>
    <EditBasicInfo />
  </Suspense>
}
