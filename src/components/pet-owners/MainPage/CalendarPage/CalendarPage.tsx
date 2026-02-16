"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import "react-day-picker/dist/style.css";
import AppointmentPage from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPage";
import { RecordPage } from "@/components/pet-owners/MainPage/CalendarPage/record/RecordPage";
import { Tabs } from "@/components/pet-owners/shared/Tabs";
import PetFilterSelector from "@/components/pet-owners/shared/PetFilterSelector";
import type { Pet, PetLite } from "@/types/domain/pet";
import { usePets } from "@/hooks/usePets";

function CalendarPageContent() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab");
    const showRecord = activeTab === "record";

    /* -------- pets -------- */
    const { pets } = usePets();

    const petOptions: PetLite[] = useMemo(
        () =>
            pets.map((p: Pet) => ({
                pet_id: p.pet_id,
                name: p.name,
                profile_image: p.profile_image,
            })),
        [pets]
    );

    const [selectedPetId, setSelectedPetId] =
        useState<number>(0);

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
                        onChange={(id) => setSelectedPetId(id || 0)}
                    />
                </div>
            </div>
            {showRecord ? (
                <RecordPage selectedPetId={selectedPetId} allPets={pets} />
            ) : (
                <AppointmentPage selectedPetId={selectedPetId} allPets={pets} />
            )}
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-4 text-center text-gray-500">Loading...</div>}>
            <CalendarPageContent />
        </Suspense>
    );
}