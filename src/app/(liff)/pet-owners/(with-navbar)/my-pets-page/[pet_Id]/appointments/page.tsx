import MyPetsAppointments from "@/components/pet-owners/MainPage/MyPetsPage/appointments/Appointments";
import { Suspense } from "react";

export default function Page() {
    return <Suspense fallback={<div>Loading...</div>}>
        <MyPetsAppointments />
    </Suspense>
}
