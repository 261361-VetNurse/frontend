'use client';

import { useSearchParams } from "next/navigation";
import "react-day-picker/dist/style.css";
import { AppointmentPage } from "@/components/pet-owners/CalendarPage/AppointmentPage";
import { RecordPage } from "@/components/pet-owners/CalendarPage/RecordPage";

export default function Page() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab");
    const showRecord = activeTab === "record";

    return showRecord ? <RecordPage /> : <AppointmentPage />;
}