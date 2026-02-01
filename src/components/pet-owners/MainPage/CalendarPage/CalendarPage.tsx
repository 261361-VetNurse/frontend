"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import "react-day-picker/dist/style.css";
import AppointmentPage from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPage";
import { RecordPage } from "@/components/pet-owners/MainPage/CalendarPage/record/RecordPage";
import { Tabs } from "@/components/pet-owners/shared/Tabs";
import PetFilterSelector, {
    type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";
import { mockPets } from "@/mocks/pets.mock";
import type { Pet, PetLite } from "@/types/domain/pet";

export default function Page() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab");
    const showRecord = activeTab === "record";

    /* -------- pets -------- */
    const petOptions: PetLite[] = useMemo(
        () =>
            mockPets.map((p: Pet) => ({
                _id: p._id,
                name: p.name,
                profile_image: p.profile_image,
            })),
        []
    );

    const [selectedPetId, setSelectedPetId] =
        useState<PetSelectorValue>("all");

    const recordTabs = [
        { name: "Appointment", path: "/appointment", params: "appointment" },
        { name: "Record", path: "/record", params: "record" },
    ];

    return (
        <div className="flex flex-col gap-[10px]">
            <div className="sticky top-0 z-50 bg-gray-50 pt-2 gap-[10px]">
                <Tabs data={recordTabs} queryKey="tab" />
                <div className="mt-2">
                    <PetFilterSelector
                        mode="filter"
                        allowAllPets
                        pets={petOptions}
                        value={selectedPetId}
                        onChange={setSelectedPetId}
                    />
                </div>
            </div>
            {showRecord ? (
                <RecordPage selectedPetId={selectedPetId} />
            ) : (
                <AppointmentPage selectedPetId={selectedPetId} />
            )}
        </div>
    );
}