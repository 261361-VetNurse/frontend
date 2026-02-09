"use client";

import SymptomRecord from "@/components/pet-owners/MainPage/MyPetsPage/symptoms/RecordPage";
import { Suspense } from "react";

export default function Page() {
  return <Suspense fallback={<div>Loading...</div>}>
    <SymptomRecord />
  </Suspense>
}
