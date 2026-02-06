import Medical from "@/components/pet-owners/MainPage/MyPetsPage/medical/Medical";
import { Suspense } from "react";

export default function Page() {
     return <Suspense fallback={<div>Loading...</div>}>
          <Medical />
     </Suspense>
}
