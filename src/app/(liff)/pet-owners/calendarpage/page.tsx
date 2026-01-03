 "use client"

import { useSearchParams } from "next/navigation";
import "react-day-picker/dist/style.css";
import { AppointmentPage } from "@/components/calendarpage/AppointmentPage";
import { RecordPage } from "@/components/calendarpage/RecordPage";

// const BoxBody = styled.div`
//     width: 100%;
//     background: red;
//     padding:16px;
//     flex-direction: column;
//     align-items: center;
//
//     .head {
//         color: #000;
//         font-size: 18px;
//         font-weight: 500;
//         margin-top: 10px;
//     }
// `;
export default function Page() {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab");
    const showRecord = activeTab === "record";

    return showRecord ? <RecordPage /> : <AppointmentPage />;
}
