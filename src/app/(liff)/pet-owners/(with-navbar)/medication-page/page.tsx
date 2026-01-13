import { Suspense } from "react";
import Medication from '@/components/pet-owners/MainPage/MedicationPage/MedicationPage';

export default function MedicationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Medication />
    </Suspense>
  );
}