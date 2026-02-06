import MedicationV2 from "@/components/pet-owners/MainPage/MyPetsPage/medication/MedicationV2";
import { Suspense } from "react";

export default function Page() {
     return <Suspense fallback={<div>Loading...</div>}>
          <MedicationV2 />
     </Suspense>
}
