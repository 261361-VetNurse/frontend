'use client';

import { useSearchParams } from "next/navigation";
import "react-day-picker/dist/style.css";
import { AppointmentPage } from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPage";
import { RecordPage } from "@/components/pet-owners/MainPage/CalendarPage/record/RecordPage";

export default function Page() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab");
    const showRecord = activeTab === "record";

    return showRecord ? <RecordPage /> : <AppointmentPage />;
}