import { Suspense } from "react";
import CalendarPage from "@/components/pet-owners/MainPage/CalendarPage/CalendarPage";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CalendarPage />
        </Suspense>
    );
}
